const P2PKH_UNLOCKING_SCRIPT_BYTES = 1 + 72 + 1 + 33
const SATS = 500
const PERBYTE = 1000

const { Varint } = bsv.encoding

/* create a contract transaction containing a JSON schema detailing the token
privateKey is the key that will sign the contract and will become the redeem address.
inputUtxos are the UTXOs which the contract will spend
paymentUtxos and paymentPrivateKey provide the fees for the transation
schema is the JSON schema describing the contract
tokenSatoshis are the amount of satoshis you will be issuing
*/
function contract (privateKey, inputUtxos, paymentUtxos, paymentPrivateKey, schema, tokenSatoshis) {
  if (privateKey === null) {
    throw new Error('Issuer private key is null')
  }
  const ownerSignCallback = (tx) => {
    tx.sign(privateKey)
  }
  let paymentSignCallback

  if (paymentPrivateKey) {
    paymentSignCallback = (tx) => {
      tx.sign(paymentPrivateKey)
    }
  }
  return contractWithCallback(privateKey.publicKey, inputUtxos, paymentUtxos, paymentPrivateKey ? paymentPrivateKey.publicKey : null, schema, tokenSatoshis, ownerSignCallback, paymentSignCallback)
}

/* create a contract transaction containing a JSON schema detailing the token and sign using the callbacks
publicKey is the publick key of the owner
inputUtxos are the UTXOs which the contract will spend
ownerSignCallback is the function that will sign the contract and will become the redeem address.
paymentUtxos and paymentSignCallback provide the fees for the transation
schema is the JSON schema describing the contract
tokenSatoshis are the amount of satoshis you will be issuing
*/
function contractWithCallback (publicKey, inputUtxos, paymentUtxos, paymentPublicKey, schema, tokenSatoshis, ownerSignCallback, paymentSignCallback) {
  if (inputUtxos === null || !Array.isArray(inputUtxos) || inputUtxos.length === 0) {
    throw new Error('inputUtxos is invalid')
  }
  if (tokenSatoshis === 0) {
    throw new Error('Token satoshis is zero')
  }
  if (publicKey === null) {
    throw new Error('Issuer public key is null')
  }
  if (ownerSignCallback === null) {
    throw new Error('ownerSignCallback is null')
  }
  if (paymentUtxos !== null && paymentUtxos.length > 0 && (paymentPublicKey === null || paymentSignCallback === null)) {
    throw new Error('Payment UTXOs provided but payment public key or paymentSignCallback is null')
  }

  if (schema === null) {
    throw new Error('Schema is null')
  }

  if ((typeof schema.symbol === 'undefined') || !validateSymbol(schema.symbol)) {
    throw new Error("Invalid Symbol. Must be between 1 and 128 long and contain alpahnumeric, '-', '_' chars.")
  }

  if ((typeof schema.satsPerToken === 'undefined') || schema.satsPerToken === 0) {
    throw new Error('Invalid satsPerToken. Must be over 0.')
  }

  if (schema.satsPerToken > tokenSatoshis) {
    throw new Error(`Token amount ${tokenSatoshis} is less than satsPerToken ${schema.satsPerToken}`)
  }

  if (tokenSatoshis % schema.satsPerToken !== 0) {
    throw new Error(`Token amount ${tokenSatoshis} must be divisible by satsPerToken ${schema.satsPerToken}`)
  }

  const tx = new bsv.Transaction()
  const isZeroFee = (paymentUtxos === null || (Array.isArray(paymentUtxos) && !paymentUtxos.length))

  let satoshis = 0

  inputUtxos.forEach(utxo => {
    tx.from(utxo)
    satoshis += Math.round(utxo.amount * SATS_PER_BITCOIN)
  })

  if (!isZeroFee) {
    paymentUtxos.forEach(utxo => {
      tx.from(utxo)
      satoshis += Math.round(utxo.amount * SATS_PER_BITCOIN)
    })
  }

  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex')

  const contractScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)

  contractScript.add(bsv.Script.buildDataOut(JSON.stringify(schema)))

  tx.addOutput(new bsv.Transaction.Output({
    script: contractScript,
    satoshis: tokenSatoshis
  }))

  if (!isZeroFee) {
    const paymentPubKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
    const changeScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${paymentPubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)

    // Calculate the change amount
    const txSize = (tx.serialize(true).length / 2) + 1 + 8 + changeScript.toBuffer().length + (tx.inputs.length * P2PKH_UNLOCKING_SCRIPT_BYTES)
    const dataFee = Math.ceil(txSize * SATS / PERBYTE)

    tx.addOutput(new bsv.Transaction.Output({
      script: changeScript,
      satoshis: Math.floor(satoshis - (dataFee + tokenSatoshis))
    }))
    // tx.sign(paymentPrivateKey)
    paymentSignCallback(tx)
  }
  // tx.sign(privateKey)
  ownerSignCallback(tx)

  return tx.serialize(true)
}

/* The issue function issues one or more token outputs by spending the outputs from the contract
   privateKey is the key that can spend the contract
   issueInfo contains the addresses to issue to, the amount in satoshis and optional arbitrary extra data that will accompany the token throughout its life.
   contractUtxo is the contract output,
   paymentUtxo pays the fees for the issue transaction
   isSplittable is a flag which sets whether the token can be split into further parts.
   version is the version of the STAS script, currently only version 2 is available.
*/
function issue (privateKey, issueInfo, contractUtxo, paymentUtxo, paymentPrivateKey, isSplittable, symbol) {
  if (privateKey === null) {
    throw new Error('Issuer private key is null')
  }
  if (paymentUtxo !== null && paymentPrivateKey === null) {
    throw new Error('Payment UTXO provided but payment private key is null')
  }

  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, privateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }
  return issueWithCallback(privateKey.publicKey, issueInfo, contractUtxo, paymentUtxo, (paymentPrivateKey ? paymentPrivateKey.publicKey : null), isSplittable, symbol, ownerSignatureCallback, paymentSignatureCallback)
}

// the minimum length of a bitcoin address
const ADDRESS_MIN_LENGTH = 26
// the maximum length of a bitcoin address
const ADDRESS_MAX_LENGTH = 35

/* The issueWithCallback function issues one or more token outputs by spending the outputs from the contract
   privateKey is the key that can spend the contract
   issueInfo contains the addresses to issue to, the amount in satoshis and optional arbitrary extra data that will accompany the token throughout its life.
   contractUtxo is the contract output,
   paymentUtxo pays the fees for the issue transaction
   isSplittable is a flag which sets whether the token can be split into further parts.
   version is the version of the STAS script, currently only version 2 is available.
*/
function issueWithCallback (publicKey, issueInfo, contractUtxo, paymentUtxo, paymentPublicKey, isSplittable, symbol, ownerSignatureCallback, paymentSignatureCallback) {
  if (publicKey === null) {
    throw new Error('Issuer public key is null')
  }
  if (ownerSignatureCallback === null) {
    throw new Error('ownerSignatureCallback is null')
  }
  if (!isIssueInfoValid(issueInfo)) {
    throw new Error('issueInfo is invalid')
  }
  if (!isUtxoValid(contractUtxo)) {
    throw new Error('contractUtxo is invalid')
  }
  if (paymentUtxo !== null && (paymentPublicKey === null || paymentSignatureCallback === null)) {
    throw new Error('Payment UTXO provided but payment publc key or paymentSignCallback is null')
  }
  if (!validateSymbol(symbol)) {
    throw new Error("Invalid Symbol. Must be between 1 and 128 long and contain alpahnumeric, '-', '_' chars.")
  }
  if (getSymbolFromContract(contractUtxo.scriptPubKey) !== symbol) {
    console.log(`contract symbol: ${getSymbolFromContract(contractUtxo.scriptPubKey)}, issue symbol: ${symbol}`)
    throw new Error('The symbol in the contract must equal symbol passed to issue')
  }
  if (isSplittable === null) {
    throw new Error('isSplittable must be a boolean value')
  }

  // if the payment UTXO is null then we treat this as a zero fee transaction
  const isZeroFee = (paymentUtxo === null)

  // check that we are spending all the input STAS tokens in the outputs.
  const totalOutSats = issueInfo.reduce((a, b) => a + b.satoshis, 0)
  if (totalOutSats !== Math.round(contractUtxo.amount * SATS_PER_BITCOIN)) {
    throw new Error(`total out amount ${totalOutSats} must equal total in amount ${Math.round(contractUtxo.amount * SATS_PER_BITCOIN)}`)
  }

  // create a new transaction
  const tx = new bsv.Transaction()

  // add the STAS input
  tx.from(contractUtxo)

  // Variable to count the input satoshis
  let satoshis = 0

  if (!isZeroFee) {
    // add the payment utxos to the transaction
    tx.from(paymentUtxo)
    satoshis += Math.round(paymentUtxo.amount * SATS_PER_BITCOIN)
  }

  issueInfo.forEach(is => {
    const pubKeyHash = addressToPubkeyhash(is.addr)
    let data
    if (is.data) {
      data = Buffer.from(is.data).toString('hex')
    }
    let hexSymbol
    if (symbol) {
      hexSymbol = Buffer.from(symbol).toString('hex')
    }
    // Add the issuing output
    const stasScript = getStasScript(pubKeyHash, publicKey, data, isSplittable, hexSymbol)

    tx.addOutput(new bsv.Transaction.Output({
      script: stasScript,
      satoshis: is.satoshis
    }))
  })

  if (!isZeroFee) {
    const paymentPubKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')

    const changeScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${paymentPubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
    // Calculate the change amount
    const txSize = (tx.serialize(true).length / 2) + 1 + 8 + changeScript.toBuffer().length + (tx.inputs.length * P2PKH_UNLOCKING_SCRIPT_BYTES)
    const fee = Math.ceil(txSize * SATS / PERBYTE)

    tx.addOutput(new bsv.Transaction.Output({
      script: changeScript,
      satoshis: Math.floor(satoshis - fee)
    }))
  }

  // bsv.js does not like signing non-standard inputs.  Therefore, we do this ourselves.
  tx.inputs.forEach((input, i) => {
    // let privKey
    let pubKey
    let sig
    if (i === 0) {
      // first input is contract
      // privKey = privateKey
      sig = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      pubKey = publicKey
    } else {
      // remaining inputs are payment utxos
      // privKey = paymentPrivateKey
      sig = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      pubKey = paymentPublicKey
    }

    // const signature = bsv.Transaction.sighash.sign(tx, privKey, sighash, i, input.output._script, input.output._satoshisBN)
    const unlockingScript = bsv.Script.fromASM(sig.toTxFormat().toString('hex') + ' ' + pubKey.toString('hex'))
    input.setScript(unlockingScript)
  })

  return tx.serialize(true)
}

// make sure issueInfo array contains the required objects
function isIssueInfoValid (issueInfo) {
  if (issueInfo === null || !Array.isArray(issueInfo) || issueInfo.length < 1) {
    return false
  }
  issueInfo.forEach(info => {
    if (info.addr.length < ADDRESS_MIN_LENGTH || info.addr.length > ADDRESS_MAX_LENGTH) {
      throw new Error(`issueInfo address must be between ${ADDRESS_MIN_LENGTH} and ${ADDRESS_MAX_LENGTH}`)
    }
    if (info.satoshis < 1) {
      throw new Error('issueInfo satoshis < 1')
    }
  })
  return true
}

function getSymbolFromContract (contractScript) {
  const ix = contractScript.indexOf('7b22') // {"
  if (ix < 0) {
    return
  }
  const or = contractScript.substring(ix)
  const schemaBuf = Buffer.from(or, 'hex')
  const schema = JSON.parse(schemaBuf.toString())
  return schema.symbol
}

// make sure issueInfo array contains the required objects
function isUtxoValid (utxo) {
  if ((!utxo) || (!utxo.constructor === Object)) {
    return false
  }
  if (!Object.prototype.hasOwnProperty.call(utxo, 'txid') ||
        !Object.prototype.hasOwnProperty.call(utxo, 'amount') ||
        !Object.prototype.hasOwnProperty.call(utxo, 'scriptPubKey') ||
        !Object.prototype.hasOwnProperty.call(utxo, 'vout')) {
    return false
  }
  return true
}

// merge will take 2 existing STAS UTXOs and combine them and assign the single UTXO to another address.
// The tokenOwnerPrivateKey must own the existing STAS UTXOs, the payment UTXOs and will be the owner of the change, if any.
function merge (tokenOwnerPrivateKey, mergeUtxos, destinationAddr, paymentUtxo, paymentPrivateKey) {
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return mergeWithCallback(tokenOwnerPrivateKey.publicKey, mergeUtxos, destinationAddr, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

// mergeSplit will take 2 existing STAS UTXOs and combine them and split them as 2 UTXOs.
// The tokenOwnerPrivateKey must own the existing STAS UTXOs, the payment UTXOs and will be the owner of the change, if any.
function mergeSplit (tokenOwnerPrivateKey, mergeUtxos, destination1Addr, amountSatoshis1, destination2Addr, amountSatoshis2, paymentUtxo, paymentPrivateKey) {
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return mergeSplitWithCallback(tokenOwnerPrivateKey.publicKey, mergeUtxos, destination1Addr, amountSatoshis1, destination2Addr, amountSatoshis2, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

// mergeSplit will take 2 existing STAS UTXOs and combine them and split them as 2 UTXOs.
// The tokenOwnerPrivateKey must own the existing STAS UTXOs, the payment UTXOs and will be the owner of the change, if any.
function mergeSplitWithCallback (tokenOwnerPublicKey, mergeUtxos, destination1Addr, amountSatoshis1, destination2Addr, amountSatoshis2, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  const isZeroFee = (paymentUtxo === null)

  if (tokenOwnerPublicKey === null) {
    throw new Error('Token owner public key is null')
  }
  if (mergeUtxos === null || !Array.isArray(mergeUtxos) || mergeUtxos.length === 0) {
    throw new Error('MergeUtxos is invalid')
  }
  if (mergeUtxos.length !== 2) {
    throw new Error('This function can only merge exactly 2 STAS tokens')
  }
  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment key is null')
  }
  if (mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].script.toHex() !== mergeUtxos[1].tx.outputs[mergeUtxos[1].vout].script.toHex()) {
    throw new Error('This function only merges STAS tokens with the same owner')
  }

  // Get the locking script (they are the same in each outpoint)...
  const lockingScript = mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].script.toHex()
  const scriptToCut = lockingScript.slice(46)
  // let stasAmount = 0

  mergeUtxos.forEach(mutxo => {
    const s = replaceAll(mutxo.tx.serialize(true), scriptToCut, ' ')
    const parts = s.split(' ')
    mutxo.piece = parts.reverse().join(' ')
    mutxo.numberOfPieces = parts.length
    // stasAmount += mutxo.tx.outputs[mutxo.vout].satoshis
  })

  const destination1PublicKeyHash = addressToPubkeyhash(destination1Addr)
  const destination2PublicKeyHash = addressToPubkeyhash(destination2Addr)

  const tx = new bsv.Transaction()

  // The first output is the 1st destination STAS output
  const stasScript1 = updateStasScript(destination1PublicKeyHash, mergeUtxos[0].scriptPubKey)

  tx.addOutput(new bsv.Transaction.Output({
    script: stasScript1,
    satoshis: amountSatoshis1
  }))

  // The second output is the 2nd destination STAS output
  const stasScript2 = updateStasScript(destination2PublicKeyHash, mergeUtxos[0].scriptPubKey)

  tx.addOutput(new bsv.Transaction.Output({
    script: stasScript2,
    satoshis: amountSatoshis2
  }))

  const stasUtxos = mergeUtxos.map(mutxo => {
    return {
      txid: mutxo.tx.id,
      vout: mutxo.vout,
      scriptPubKey: mutxo.tx.outputs[mutxo.vout].script.toHex(),
      satoshis: mutxo.tx.outputs[mutxo.vout].satoshis
    }
  })

  tx.from(stasUtxos)

  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }

  const extraBytesForPieces = mergeUtxos[0].piece.length + 8 + mergeUtxos[1].piece.length + 8
  if (!isZeroFee) {
    handleChangeForMerge(tx, extraBytesForPieces, paymentPublicKey)
  }
  const preimageBuf = preimageFn(tx, sighash, 0, bsv.Script(lockingScript), new bsv.crypto.BN(mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].satoshis))
  const preimage = preimageBuf.buf.toString('hex')
  const preimageBufMerge = preimageFn(tx, sighash, 1, bsv.Script(lockingScript), new bsv.crypto.BN(mergeUtxos[1].tx.outputs[mergeUtxos[1].vout].satoshis))
  const preimageMerge = preimageBufMerge.buf.toString('hex')

  let paymentPubKeyHash
  let reversedFundingTXID
  if (!isZeroFee) {
    reversedFundingTXID = reverseEndian(paymentUtxo.txid)

    // const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(destinationPublicKey.toBuffer()).toString('hex')
    paymentPubKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
  }

  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const sigASM = signature.toTxFormat().toString('hex')
      let s
      if (isZeroFee) {
        s = numberToLESM(tx.outputs[0].satoshis) + ' ' + destination1PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + destination2PublicKeyHash +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + `OP_${mergeUtxos[1].vout}` +
                    ' ' + mergeUtxos[1].piece + ' ' + `OP_${mergeUtxos[1].numberOfPieces}` +
                    ' ' + preimage +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      } else {
        s = numberToLESM(tx.outputs[0].satoshis) + ' ' + destination1PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + destination2PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPubKeyHash +
                    ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
                    ' ' + `OP_${mergeUtxos[1].vout}` +
                    ' ' + mergeUtxos[1].piece + ' ' + `OP_${mergeUtxos[1].numberOfPieces}` +
                    ' ' + preimage +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      }

      tx.inputs[0].setScript(bsv.Script.fromASM(s))
    } else if (i === 1) {
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const sigASM = signature.toTxFormat().toString('hex')
      let s
      if (isZeroFee) {
        s = numberToLESM(tx.outputs[0].satoshis) + ' ' + destination1PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + destination2PublicKeyHash +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + `OP_${mergeUtxos[0].vout}` +
                    ' ' + mergeUtxos[0].piece + ' ' + `OP_${mergeUtxos[0].numberOfPieces}` +
                    ' ' + preimageMerge +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      } else {
        s = numberToLESM(tx.outputs[0].satoshis) + ' ' + destination1PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + destination2PublicKeyHash +
                    ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPubKeyHash +
                    ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
                    ' ' + `OP_${mergeUtxos[0].vout}` +
                    ' ' + mergeUtxos[0].piece + ' ' + `OP_${mergeUtxos[0].numberOfPieces}` +
                    ' ' + preimageMerge +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      }

      tx.inputs[1].setScript(bsv.Script.fromASM(s))
    } else if (!isZeroFee) {
      // const signature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
      input.setScript(unlockingScript)
    }
  })

  return tx.serialize(true)
}

function handleChangeForMerge (tx, extraDataBytes, publicKey) {
  // In this implementation, we will always add a change output...

  // Create a change output. The satoshi amount will be updated after we calculate the fees.
  // ---------------------------------------------------------------------------------------
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex')

  const changeScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  tx.addOutput(new bsv.Transaction.Output({
    script: changeScript,
    satoshis: 0
  }))

  // Now we need to calculate the preimage of the transaction.  This will become part of the unlocking script
  // and therefore increases the size and cost of the overall TX.
  const image = preimageFn(tx, sighash, 0, tx.inputs[0].output.script, tx.inputs[0].output.satoshisBN)
  const preimageLen = new Varint().fromNumber(image.buf.length).toBuffer().length

  // Calculate the fee required
  // ---------------------------------------------------------------------------------------
  // The actual unlocking script for STAS will be:
  // STAS amount                                       Up to 9 bytes
  // pubkeyhash                                        21 bytes
  // OP_FALSE OP_FALSE OP_FALSE OP_FALSE (4 bytes)     4
  // Output funding index                              Up to 9 bytes
  // TXID                                              33 bytes
  // Output index                                      Up to 9 bytes
  // Pieces (Partly P2PSH)                             (passed in to function)
  // Size of the number of pieces                      1 byte
  // OP_PUSH(<len(preimage)                             preimageLen  // There are 2 preimages, 1 for input 0 and 1 for input 1
  // Preimage (len(preimage)                           len(preimage)
  // OP_PUSH_72                                           1 byte
  // <signature> DER-encoded signature (70-72 bytes) -   72 bytes
  // OP_PUSH_33                                           1 byte
  // <public key> - compressed SEC-encoded public key  - 33 bytes

  // Calculate the fees required...
  let txSizeInBytes = tx.toBuffer().length + 9 + 21 + 4 + 9 + 33 + 9 + extraDataBytes + ((preimageLen + image.buf.length) * 2) + 1 + 72 + 1 + 33
  txSizeInBytes += ((tx.inputs.length - 1) * P2PKH_UNLOCKING_SCRIPT_BYTES)

  let satoshis = 0
  tx.inputs.forEach((input, i) => {
    if (i > 1) { // Skip the 2 STAS inputs...
      satoshis += input.output.satoshis
    }
  })

  const fee = Math.ceil(txSizeInBytes * SATS / PERBYTE)

  tx.outputs[tx.outputs.length - 1].satoshis = satoshis - fee
}

// merge will take 2 existing STAS UTXOs and combine them and assign the single UTXO to another address.
// The tokenOwnerPrivateKey must own the existing STAS UTXOs, the payment UTXOs and will be the owner of the change, if any.
function mergeWithCallback (tokenOwnerPublicKey, mergeUtxos, destinationAddr, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  // const BN = bsv.crypto.BN
  const isZeroFee = (paymentUtxo === null)

  if (tokenOwnerPublicKey === null) {
    throw new Error('Token owner public key is null')
  }
  if (destinationAddr === null) {
    throw new Error('Destination address is null')
  }
  if (mergeUtxos === null || !Array.isArray(mergeUtxos) || mergeUtxos.length === 0) {
    throw new Error('MergeUtxos is invalid')
  }
  if (mergeUtxos.length !== 2) {
    throw new Error('This function can only merge exactly 2 STAS tokens')
  }

  if (mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].script.toHex() !== mergeUtxos[1].tx.outputs[mergeUtxos[1].vout].script.toHex()) {
    throw new Error('This function only merges STAS tokens with the same owner')
  }

  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment key is null')
  }

  // Get the locking script (they are the same in each outpoint)...
  const lockingScript = mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].script.toHex()
  const scriptToCut = lockingScript.slice(46)

  let stasAmount = 0

  mergeUtxos.forEach(mutxo => {
    const s = replaceAll(mutxo.tx.serialize(true), scriptToCut, ' ')
    const parts = s.split(' ')
    mutxo.piece = parts.reverse().join(' ')
    mutxo.numberOfPieces = parts.length
    stasAmount += mutxo.tx.outputs[mutxo.vout].satoshis
  })
  const destinationPubkeyHash = addressToPubkeyhash(destinationAddr)
  const stasScript = updateStasScript(destinationPubkeyHash, lockingScript)

  const tx = new bsv.Transaction()

  const stasUtxos = mergeUtxos.map(mutxo => {
    return {
      txid: mutxo.tx.id,
      vout: mutxo.vout,
      scriptPubKey: mutxo.tx.outputs[mutxo.vout].script.toHex(),
      satoshis: mutxo.tx.outputs[mutxo.vout].satoshis
    }
  })

  tx.from(stasUtxos)

  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }
  tx.addOutput(new bsv.Transaction.Output({
    script: stasScript,
    satoshis: Math.floor(stasAmount)
  }))

  const extraBytesForPieces = mergeUtxos[0].piece.length + 8 + mergeUtxos[1].piece.length + 8
  if (!isZeroFee) {
    handleChangeForMerge(tx, extraBytesForPieces, paymentPublicKey)
  }
  const preimageBuf = preimageFn(tx, sighash, 0, bsv.Script(lockingScript), new bsv.crypto.BN(mergeUtxos[0].tx.outputs[mergeUtxos[0].vout].satoshis))
  const preimage = preimageBuf.buf.toString('hex')
  const preimageBufMerge = preimageFn(tx, sighash, 1, bsv.Script(lockingScript), new bsv.crypto.BN(mergeUtxos[1].tx.outputs[mergeUtxos[1].vout].satoshis))
  const preimageMerge = preimageBufMerge.buf.toString('hex')

  let reversedFundingTXID
  let paymentPubKeyHash
  if (!isZeroFee) {
    reversedFundingTXID = reverseEndian(paymentUtxo.txid)
    // const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(destinationPublicKey.toBuffer()).toString('hex')
    paymentPubKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
  }
  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const sigASM = signature.toTxFormat().toString('hex')
      let s
      if (isZeroFee) {
        s = numberToLESM(stasAmount) + ' ' + destinationPubkeyHash +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + `OP_${mergeUtxos[1].vout}` +
                    ' ' + mergeUtxos[1].piece + ' ' + `OP_${mergeUtxos[1].numberOfPieces}` +
                    ' ' + preimage +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      } else {
        s = numberToLESM(stasAmount) + ' ' + destinationPubkeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + paymentPubKeyHash +
                    ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
                    ' ' + `OP_${mergeUtxos[1].vout}` +
                    ' ' + mergeUtxos[1].piece + ' ' + `OP_${mergeUtxos[1].numberOfPieces}` +
                    ' ' + preimage +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      }

      tx.inputs[0].setScript(bsv.Script.fromASM(s))
    } else if (i === 1) {
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const sigASM = signature.toTxFormat().toString('hex')
      let s
      if (isZeroFee) {
        s = numberToLESM(stasAmount) + ' ' + destinationPubkeyHash +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + 'OP_FALSE OP_FALSE' +
                    ' ' + `OP_${mergeUtxos[0].vout}` +
                    ' ' + mergeUtxos[0].piece + ' ' + `OP_${mergeUtxos[0].numberOfPieces}` +
                    ' ' + preimageMerge +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      } else {
        s = numberToLESM(stasAmount) + ' ' + destinationPubkeyHash +
                    ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + paymentPubKeyHash +
                    ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
                    ' ' + `OP_${mergeUtxos[0].vout}` +
                    ' ' + mergeUtxos[0].piece + ' ' + `OP_${mergeUtxos[0].numberOfPieces}` +
                    ' ' + preimageMerge +
                    ' ' + sigASM + ' ' + tokenOwnerPublicKey.toString('hex')
      }

      tx.inputs[1].setScript(bsv.Script.fromASM(s))
    } else if (!isZeroFee) {
      // const signature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
      input.setScript(unlockingScript)
    }
  })

  return tx.serialize(true)
}

const {
  BN,
  Hash,
  Signature
} = bsv.crypto

const {
  BufferReader,
  BufferWriter
} = bsv.encoding

const {
  _
} = bsv.deps

const $ = {
  checkArgument: function (condition, msg) {
    if (!condition) {
      throw new Error(msg)
    }
  }
}

// preimage is extracted from MoneyButton's bsv library - sighash.js
function preimage (transaction, sighashType, inputNumber, subscript, satoshisBN) {
  const input = transaction.inputs[inputNumber]
  $.checkArgument(
    satoshisBN instanceof BN,
    'For ForkId=0 signatures, satoshis or complete input must be provided'
  )

  function GetPrevoutHash (tx) {
    const writer = new BufferWriter()

    _.each(tx.inputs, function (input) {
      writer.writeReverse(input.prevTxId)
      writer.writeUInt32LE(input.outputIndex)
    })

    const buf = writer.toBuffer()
    const ret = Hash.sha256sha256(buf)
    return ret
  }

  function GetSequenceHash (tx) {
    const writer = new BufferWriter()

    _.each(tx.inputs, function (input) {
      writer.writeUInt32LE(input.sequenceNumber)
    })

    const buf = writer.toBuffer()
    const ret = Hash.sha256sha256(buf)
    return ret
  }

  function GetOutputsHash (tx, n) {
    const writer = new BufferWriter()

    if (_.isUndefined(n)) {
      _.each(tx.outputs, function (output) {
        output.toBufferWriter(writer)
      })
    } else {
      tx.outputs[n].toBufferWriter(writer)
    }

    const buf = writer.toBuffer()
    const ret = Hash.sha256sha256(buf)
    return ret
  }

  let hashPrevouts = Buffer.alloc(32)
  let hashSequence = Buffer.alloc(32)
  let hashOutputs = Buffer.alloc(32)

  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY)) {
    hashPrevouts = GetPrevoutHash(transaction)
  }

  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY) &&
        (sighashType & 31) !== Signature.SIGHASH_SINGLE &&
        (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashSequence = GetSequenceHash(transaction)
  }

  if ((sighashType & 31) !== Signature.SIGHASH_SINGLE && (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashOutputs = GetOutputsHash(transaction)
  } else if ((sighashType & 31) === Signature.SIGHASH_SINGLE && inputNumber < transaction.outputs.length) {
    hashOutputs = GetOutputsHash(transaction, inputNumber)
  }

  const writer = new BufferWriter()

  // Version
  writer.writeInt32LE(transaction.version)

  // Input prevouts/nSequence (none/all, depending on flags)
  writer.write(hashPrevouts)
  writer.write(hashSequence)

  //  outpoint (32-byte hash + 4-byte little endian)
  writer.writeReverse(input.prevTxId)
  writer.writeUInt32LE(input.outputIndex)

  // scriptCode of the input (serialized as scripts inside CTxOuts)
  writer.writeVarintNum(subscript.toBuffer().length)
  writer.write(subscript.toBuffer())

  // value of the output spent by this input (8-byte little endian)
  writer.writeUInt64LEBN(satoshisBN)

  // nSequence of the input (4-byte little endian)
  const sequenceNumber = input.sequenceNumber
  writer.writeUInt32LE(sequenceNumber)

  // Outputs (none/one/all, depending on flags)
  writer.write(hashOutputs)

  // Locktime
  writer.writeUInt32LE(transaction.nLockTime)

  // sighashType
  writer.writeUInt32LE(sighashType >>> 0)

  const buf = writer.toBuffer()
  return new BufferReader(buf)
}

/*
 Redeem converts the STAS tokens back to BSV satoshis and sends them to the redeem address that was
 specified when the token was created.
 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 contractPublicKey is the redeem address
 paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function redeem (tokenOwnerPrivateKey, contractPublicKey, stasUtxo, paymentUtxo, paymentPrivateKey) {
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return redeemWithCallback(tokenOwnerPrivateKey.publicKey, contractPublicKey, stasUtxo, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

/*
 RedeemSplit splits the STAS input and sends tokens to the recipients specified in the
 splitDestinations parameter, the rest of the STAS tokens are converted back to BSV
 satoshis and sent to the redeem address that was specified when the token was created.

 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 splitDestinations is an array containg the address and amount of the recipients of the tokens, the rest or the input will
 be redeemed
 contractPublicKey is the redeem address
 paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function redeemSplit (tokenOwnerPrivateKey, contractPublicKey, stasUtxo, splitDestinations, paymentUtxo, paymentPrivateKey) {
  if (contractPublicKey === null) {
    throw new Error('contract public key is null')
  }
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return redeemSplitWithCallback(tokenOwnerPrivateKey.publicKey, contractPublicKey, stasUtxo, splitDestinations, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

/*
 RedeemSplit splits the STAS input and sends tokens to the recipients specified in the
 splitDestinations parameter, the rest of the STAS tokens are converted back to BSV
 satoshis and sent to the redeem address that was specified when the token was created.

 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 splitDestinations is an array containg the address and amount of the recipients of the tokens, the rest or the input will
 be redeemed
 contractPublicKey is the redeem address
 paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function redeemSplitWithCallback (tokenOwnerPublicKey, contractPublicKey, stasUtxo, splitDestinations, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  if (contractPublicKey === null) {
    throw new Error('contract public key is null')
  }
  if (tokenOwnerPublicKey === null) {
    throw new Error('issuer public key is null')
  }
  if (splitDestinations === null || splitDestinations.length === 0) {
    throw new Error('split destinations array is null or empty')
  }

  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment public key is null')
  }

  validateSplitDestinations(splitDestinations)

  const isZeroFee = (paymentUtxo === null)

  const tx = new bsv.Transaction()

  tx.from(stasUtxo)
  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }

  // The first output is the change
  const version = getVersion(stasUtxo.scriptPubKey)
  const totalOutSats = splitDestinations.reduce((a, b) => a + Math.round(b.amount * SATS_PER_BITCOIN), 0)

  const redeemSats = Math.round(stasUtxo.amount * SATS_PER_BITCOIN) - totalOutSats

  if (redeemSats <= 0) {
    throw new Error('Not enough input Satoshis to cover output')
  }

  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(contractPublicKey.toBuffer()).toString('hex')

  const redeemScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)

  tx.addOutput(new bsv.Transaction.Output({
    script: redeemScript,
    satoshis: redeemSats
  }))

  const segments = []
  segments.push({
    satoshis: redeemSats,
    publicKey: bsv.crypto.Hash.sha256ripemd160(contractPublicKey.toBuffer()).toString('hex')
  })

  splitDestinations.forEach(sd => {
    const destinationPublicKeyHash = addressToPubkeyhash(sd.address)
    // The other outputs are the STAS tokens remaining
    const pkh = addressToPubkeyhash(sd.address)
    const sats = Math.round(sd.amount * SATS_PER_BITCOIN)
    const stasScript = updateStasScript(destinationPublicKeyHash, stasUtxo.scriptPubKey)

    tx.addOutput(new bsv.Transaction.Output({
      script: stasScript,
      satoshis: sats
    }))

    segments.push({
      satoshis: sats,
      publicKey: pkh
    })
  })
  if (!isZeroFee) {
    handleChange(tx, paymentPublicKey)
    segments.push({
      satoshis: tx.outputs[tx.outputs.length - 1].satoshis,
      publicKey: bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
    })
  }
  // Sign the inputs...
  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)

      completeSTASUnlockingScript(
        tx,
        segments,
        signature.toTxFormat().toString('hex'),
        tokenOwnerPublicKey.toString('hex'),
        version,
        isZeroFee
      )
    } else if (!isZeroFee) {
      // const signature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
      input.setScript(unlockingScript)
    }
  })

  return tx.serialize(true)
}

/*
 Redeem converts the STAS tokens back to BSV satoshis and sends them to the redeem address that was
 specified when the token was created.
 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 contractPublicKey is the redeem address
 paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function redeemWithCallback (tokenOwnerPublicKey, contractPublicKey, stasUtxo, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  if (tokenOwnerPublicKey === null) {
    throw new Error('Token owner public key is null')
  }

  if (contractPublicKey === null) {
    throw new Error('contract public key is null')
  }

  if (stasUtxo === null) {
    throw new Error('stasUtxo is null')
  }

  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment key is null')
  }
  if (paymentUtxo === null && paymentPublicKey !== null) {
    throw new Error('Payment key provided but payment UTXO is null')
  }

  const isZeroFee = (paymentUtxo === null)

  const tx = new bsv.Transaction()

  tx.from(stasUtxo)

  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }

  // Now pay the satoshis that are tied up in the STAS token to the redeemPublicKey...
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(contractPublicKey.toBuffer()).toString('hex')

  const redeemScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  tx.addOutput(new bsv.Transaction.Output({
    script: redeemScript,
    satoshis: Math.round(stasUtxo.amount * SATS_PER_BITCOIN)
  }))

  if (!isZeroFee) {
    handleChange(tx, paymentPublicKey)
  }

  // Sign the inputs...
  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const segments = []
      segments.push(
        {
          satoshis: Math.round(stasUtxo.amount * SATS_PER_BITCOIN),
          publicKey: bsv.crypto.Hash.sha256ripemd160(contractPublicKey.toBuffer()).toString('hex')
        })
      segments.push(null)

      if (tx.outputs.length > 1 && !isZeroFee) {
        segments.push({
          satoshis: tx.outputs[1].satoshis,
          publicKey: bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
        })
      }

      completeSTASUnlockingScript(
        tx,
        segments,
        signature.toTxFormat().toString('hex'),
        tokenOwnerPublicKey.toString('hex'),
        getVersion(stasUtxo.scriptPubKey),
        isZeroFee
      )
    } else if (!isZeroFee) {
      // const signature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
      input.setScript(unlockingScript)
    }
  })

  return tx.serialize(true)
}

/* split will take an existing STAS UTXO and assign it to up to 4 addresses.
The tokenOwnerPrivateKey must own the existing STAS UTXO.
the paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function split (tokenOwnerPrivateKey, stasUtxo, splitDestinations, paymentUtxo, paymentPrivateKey) {
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return splitWithCallback(tokenOwnerPrivateKey.publicKey, stasUtxo, splitDestinations, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

/* split will take an existing STAS UTXO and assign it to up to 4 addresses.
The tokenOwnerPrivateKey must own the existing STAS UTXO.
the paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function splitWithCallback (tokenOwnerPublicKey, stasUtxo, splitDestinations, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  if (splitDestinations === null || splitDestinations.length === 0) {
    throw new Error('split destinations array is null or empty')
  }

  if (tokenOwnerPublicKey === null) {
    throw new Error('Token owner public key is null')
  }

  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment key is null')
  }
  if (paymentUtxo === null && paymentPublicKey !== null) {
    throw new Error('Payment key provided but payment UTXO is null')
  }

  validateSplitDestinations(splitDestinations)

  const isZeroFee = paymentUtxo === null

  const tx = new bsv.Transaction()

  // const destination1PublicKeyHash = addressToPubkeyhash(destination1Addr)
  // const destination2PublicKeyHash = addressToPubkeyhash(destination2Addr)

  tx.from(stasUtxo)

  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }

  const segments = []
  const version = getVersion(stasUtxo.scriptPubKey)

  splitDestinations.forEach(sd => {
    const pkh = addressToPubkeyhash(sd.address)
    const sats = Math.round(sd.amount * SATS_PER_BITCOIN)
    const stasScript = updateStasScript(pkh, stasUtxo.scriptPubKey)

    tx.addOutput(new bsv.Transaction.Output({
      script: stasScript,
      satoshis: sats
    }))
    segments.push({
      satoshis: sats,
      publicKey: pkh
    })
  })
  if (!isZeroFee) {
    handleChange(tx, paymentPublicKey)
    segments.push({
      satoshis: tx.outputs[tx.outputs.length - 1].satoshis,
      publicKey: bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
    })
  }

  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)

      completeSTASUnlockingScript(
        tx,
        segments,
        signature.toTxFormat().toString('hex'),
        tokenOwnerPublicKey.toString('hex'),
        version,
        isZeroFee
      )
    } else {
      // const signature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
      const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
      input.setScript(unlockingScript)
    }
  })

  return tx.serialize(true)
}

/*
EVALUATION LICENSE AGREEMENT
This evaluation license agreement (“Agreement”) is between Taal DIT GmbH (“Taal”), a Swiss corporation and the person or entity on whose behalf this Agreement is accepted (“User”).  This Agreement is effective as of the date (“Effective Date”) the User first downloads, accesses or uses the Product (as defined below) from the website on which this Agreement is acknowledged.  If the User is an entity, the individual agreeing to this Agreement represents and warrants that he or she is authorized to accept this Agreement on behalf of the entity as an authorized representative of such entity.
By accessing and/or downloading the Product, the User agrees to be bound by the terms of this Agreement.  If the User does not agree to the terms of this Agreement, the User may not use the Product.

1. DEFINITIONS
1.1. “Confidential Information” means any information, technical data or know-how, of Taal including without limitation, that which relates to Taal computer software programs, documentation, specifications, source code, object code, research, inventions, processes, designs, drawings, engineering, products, services, customers, benchmark tests, markets, prices, or finances, which should reasonably be considered Confidential Information.  Confidential Information will not include any information that: (a) has been or is obtained by the receiving party from an independent source without obligation of confidentiality, (b) is or becomes publicly available other than as a result of an unauthorized disclosure by the receiving party or its personnel, or (c) is independently developed by the receiving party without reliance in any way on the Confidential Information disclosed.
1.4. “Product” means the template software code providing a method to encode tokens onto the Bitcoin SV blockchain.
1.5. “Documentation” means any technical information, white papers, user manuals generally made available to Users of the Product.  The Documentation constitutes an integral part of this Agreement and is part of the Product.
1.6. “Evaluation Term” the period after the Effective Date prior to the date Taal publishes a revocation of the license granted by this Agreement on the website.

2. GRANT OF RIGHTS
2.1. Licenses.
(a) Evaluation License.  Subject to the terms and conditions of this Agreement, Taal hereby grants to User, during the Evaluation Term, a non-exclusive, non-transferable, revocable worldwide right and license (without a right to sublicense) to install and operate, modify, use publish and distributed on the Bitcoin SV blockchain the Product solely in a non-production, non-commercial environment limited to experimentation, evaluation and study purposes with respect to token generation and smart contracts.  Any use other than for non-commercial purposes requires a commercial license.
(b) Documentation License.  Subject to the terms and conditions of this Agreement, Taal hereby grants to User a non-exclusive, non-transferable, worldwide right and license (without a right to sublicense) to use the Documentation, solely for User’s internal use and solely for the purpose of exercising the rights granted in Section 2.1(a).  User acknowledges that no right is granted to modify, adapt, translate, publicly display, publish, create derivative works or distribute the Documentation.
2.2. Limitations.  User will not: (a) assign, sublicense, transfer, lease, rent or distribute any of its rights in the Product; (b) use the Product for the benefit of any third party including as part of any service bureau, time sharing or third party training arrangement; or (c) publish any benchmark testing results on the Product without Taal’s written consent.  The above copyright notice shall be included in all copies or substantial portions of the Product that you modify: © 2020 TAAL DIT GmbH. You must cause any modifications and / or derivative works of the Product to carry prominent notices stating that you changed the Product and clearly identify the modifications.  The mere use of the templates and completion of required fields, shall not be considered to be modification.
2.3. Third-Party Restrictions.  User will undertake all measures necessary to ensure that its use of the Product complies in all respects with any contractual or other legally binding obligations of Taal to any third party, provided that Taal has notified User with respect to any such obligations.
2.4. Ownership and Reservation of Rights.  Except for the licenses granted User in this Section 2, Taal will retain all right, title and interest in and to the Product and all copies.  Such right, title and interest will include ownership of, without limitation, all copyrights, patents, trade secrets and other intellectual property rights.  User will not claim or assert title to any portion of the Product or any copies.  In the event User modifies or authorizes the modification or translation of the Product, including any Documentation, User hereby assigns all right, title and interest in any derivative work to Taal and agrees to cooperate as reasonably requested by Taal to perfect any such rights. Any such modifications or translations shall also fall under this license.

3. OBLIGATIONS OF USER
3.1. User will be solely responsible for obtaining and installing all proper hardware and support software (including with-out limitation operating systems and network devices) and for proper installation of the Product.  Further details are specified in the Documentation.
3.2. User will be solely responsible for maintaining all software and hardware (including without limitation network systems) that are necessary for User to properly exercise the licenses granted hereunder.  This includes, in particular, the minimum requirements specified in the Documentation.
3.3. Taal will have no responsibility or liability under this Agreement for any unavailability, failure of, nonconformity, or defect in, any of the Product.
3.4. User will be solely responsible for creating and maintaining back-ups, security updates and compatible versions of all data used in connection with the Product.
3.5. User will undertake all measures necessary to ensure that its use of the Product complies in all respects with applicable laws, statutes, regulations, ordinances or other rules promulgated by governing authorities having jurisdiction over User or the Product.  User shall not use the Product unless such use is in compliance with applicable laws.

4. SUPPORT AND MAINTENANCE SERVICES
4.1. Taal will have no obligation to provide or perform any support and maintenance services for or on behalf of User.
4.2. Any support and maintenance services shall require the execution of a separate service agreement between the Parties.

5. PROFESSIONAL SERVICES
5.1. Unless otherwise agreed between the parties in writing, Taal will have no obligation to provide or perform any professional services for or on behalf of User.
5.2. Any professional services shall require the execution of a separate service agreement between the Parties.

6. NO FEES
The evaluation license will be granted free-of-charge during the Evaluation Term.

7. WARRANTY DISCLAIMER
7.1. Delivery.  The Product will be delivered to the User via download link on the Taal website.
7.2. Disclaimer.  THE PRODUCT IS DELIVERED “AS IS”. TAAL DISCLAIMS ALL WARRANTIES RELATED TO THE PRODUCT, DOCUMENTATION AND SERVICES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, SECURITY, NO INFRINGEMENT, QUIET ENJOYMENT, COURSE OF DEALING OR USAGE OF TRADE.

8. NONDISCLOSURE AND CONFIDENTIALITY
8.1. Nondisclosure Obligations.  All Confidential Information: (a) will not be copied or distributed, disclosed, or disseminated in any way or form by the User to anyone except its own employees, agents, or contractors, who have a reasonable need to know the Confidential Information; (b) will be treated by the User with the same degree of care as is used with respect to the receiving party’s own information of like importance, but with no less than reasonable care; (c) will not be used by the User for any other purpose except as set forth in this Agreement, without the express written permission of Taal; and (d) will remain the property of and be returned to the Taal (along with all copies thereof) within thirty (30) days of receipt by the User of a written request from Taal setting forth the Confidential Information to be returned or upon expiration or termination of this Agreement.
8.2. Compelled Legal Disclosure.  In the event the User becomes legally compelled to disclose any Confidential Information, the User will provide Taal party with prompt prior written notice of such requirement and the User will reasonably cooperate in any effort by Taal to petition the authority compelling such disclosure for an order that such disclosure not occur or that it occur pursuant to terms and conditions designed to ensure continued confidentiality or minimized disclosure.
8.3. Term.  The confidentiality provisions of this Sec. 8 will survive termination or expiration of this Agreement.

9. INDEMNIFICATION
User Indemnity.  User will indemnify, defend and hold harmless Taal, its directors, officers, employees and representatives, from and against any and all losses, damages, liability, costs and expenses awarded by a court or agreed upon in settlement, as well as all reasonable and related attorneys’ fees and court costs, arising out of any third party claim arising out of a User breach of any term of this Agreement or if the alleged claim arises, in whole or in part, from: (a) any modification, servicing or addition made to the Product or any part thereof by the User; (b) any use of the Product by User in a manner outside the scope of any right granted or in breach of this Agreement; (c) the use of such Product or any part thereof as a part or combination with any materials, devices, parts, software or processes not provided by or approved by Taal; or (d) the use of other than the then-current, unaltered release of the Product or any part thereof available from Taal.

10. AUDITS AND CERTIFICATION OF COMPLIANCE
10.1. Audits.  Taal will have the right to audit User’s records to ensure compliance with the terms of this Agreement, upon reasonable written notice.  Such audits may be conducted by Taal personnel or by an independent third party auditor appointed by Taal.  User will grant Taal and/or an independent third party auditor appointed by Taal reasonable access to its personnel, records and facilities for such purpose.  All such audits will be conducted during normal business hours.
10.2. Anonymous Usage Tracking.  Taal reserves the right to collect and store the IP addresses of devices used to access the Product as well as anonymous usage data regarding the Product (e.g., information on the product version used).

11. TERM AND TERMINATION
11.1. Term.  This Agreement becomes effective on the Effective Date and is and shall run for the Evaluation Term.
11.2. Conditions of Termination.  Following termination of this Agreement, for any reason, the license in the Product granted hereunder to User will terminate and User will discontinue the use of the Product and all Confidential Information that had been furnished to User by Taal pursuant to this Agreement.  User will immediately: (a) delete the Confidential Information from its computer storage or any other media, including, but not limited to, online and off-line libraries; (b) return to Taal, or at Taal’s option, destroy, all copies of Confidential Information then in its possession.
11.3. Survival. Paragraphs 1, 2.2, 2.4, 3 and 7 through 13 will survive termination or expiration of this Agreement.

12. PROPRIETARY RIGHTS
12.1. Copyright and Trademark Notices.  User will duplicate all proprietary notices and legends of Taal upon any and all copies of the Product, including any Documentation, made by User.
12.2. No Removal.  User will not remove, alter or obscure any such proprietary notice or legend.

13. GENERAL PROVISIONS
13.1. Notices.  All notices will be posted on the Taal website where this Agreement is posted.  It is the responsibility of the User to review notices, which shall be binding ten (10) days after posting.
13.2. Marketing.  The User agrees that Taal shall be entitled to refer to the cooperation with the User and to use the name and logo of the User for marketing purposes, e.g. on Taal’s website.
13.3. Force Majeure.  Neither party will be responsible for delay or failure in performance resulting from acts beyond the control of such party.  Such acts will include, but not be limited to: an act of God; an act of war; an act of terrorism; riot; an epidemic; fire; flood or other disaster; an act of government; a strike or lockout; a communication line failure; power failure or failure of the computer equipment.
13.4. Governing Law.  This Agreement will be governed by and construed in accordance with the laws of the Switzerland excluding its conflicts of law rules.  The U.N. Convention on the International Sale of Goods (CISG) will not apply to this Agreement in whole or in part.  The parties agree that Zug, Switzerland will be the exclusive venue for claims arising out of or in connection with this Agreement and all parties submit to the jurisdiction of the courts in Switzerland.
13.5. Assignment.  Taal may, upon written notice to User, assign this Agreement to another party.  User may not assign this Agreement.
13.6. Entire Agreement.  This Agreement contains the entire understanding of the parties with respect to the matter contained herein and supersedes all prior and contemporaneous understandings.  This Agreement may not be modified except in writing and signed by authorized representatives of Taal and User.  Digital signatures are deemed to be equivalent to original signatures for purposes of this Agreement.
*/

const marker = '0011223344556677889900112233445566778899'
// const flagMarker = '0100'

// Unfortunately, bsv.js v1.x.x does not define all BSV opcodes.  As a workaround, we define the script in hex rather than ASM
const stasV2 = '76a914[destinationPublicKeyHash]88ac6976aa607f5f7f7c5e7f7c5d7f7c5c7f7c5b7f7c5a7f7c597f7c587f7c577f7c567f7c557f7c547f7c537f7c527f7c517f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7c5f7f7c5e7f7c5d7f7c5c7f7c5b7f7c5a7f7c597f7c587f7c577f7c567f7c557f7c547f7c537f7c527f7c517f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e01007e818b21414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff007d976e7c5296a06394677768827601249301307c7e23022079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798027e7c7e7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c8276638c687f7c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e01417e21038ff83d8cf12121491609c4939dc11c4aa35503508fe432dc5a5c1905608b9218ad547f7701207f01207f7701247f517f7801007e8102fd00a063546752687f7801007e817f727e7b01177f777b557a766471567a577a786354807e7e676d68aa880067765158a569765187645294567a5379587a7e7e78637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6878637c8c7c53797e577a7e6867567a6876aa587a7d54807e577a597a5a7a786354807e6f7e7eaa727c7e676d6e7eaa7c687b7eaa587a7d877663516752687c72879b69537a647500687c7b547f77517f7853a0916901247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f77788c6301247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f777852946301247f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e816854937f77686877517f7c52797d8b9f7c53a09b91697c76638c7c587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f777c6876638c7c587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f777c6863587f77517f7c01007e817602fc00a06302fd00a063546752687f7c01007e81687f7768587f517f7801007e817602fc00a06302fd00a063546752687f7801007e81727e7b7b687f75537f7c0376a9148801147f775379645579887567726881766968789263556753687a76026c057f7701147f8263517f7c766301007e817f7c6775006877686b537992635379528763547a6b547a6b677c6b567a6b537a7c717c71716868547a587f7c81547a557964936755795187637c686b687c547f7701207f75748c7a7669765880748c7a76567a876457790376a9147e7c7e557967041976a9147c7e0288ac687e7e5579636c766976748c7a9d58807e6c0376a9147e748c7a7e6c7e7e676c766b8263828c007c80517e846864745aa0637c748c7a76697d937b7b58807e56790376a9147e748c7a7e55797e7e6868686c567a5187637500678263828c007c80517e846868647459a0637c748c7a76697d937b7b58807e55790376a9147e748c7a7e55797e7e687459a0637c748c7a76697d937b7b58807e55790376a9147e748c7a7e55797e7e68687c537a9d547963557958807e041976a91455797e0288ac7e7e68aa87726d77776a14[redemptionPublicKeyHash]'
const script2 = stasV2.replace('[destinationPublicKeyHash]', marker).replace('[redemptionPublicKeyHash]', marker)// .replace('[flags]', flagMarker)
const stasV2Regex = new RegExp('^' + replaceAll(script2, marker, '[0-9a-fA-F]{40}') + '(0100|0101).*$')

// group 1: isSplittable flag, group 2: symbol, group 3: data
const stasV2DataRegex = /OP_RETURN [0-9a-fA-F]{40} (00|01)([\s]?[\S]*[\s]?)([a-f0-9]*)+$/

const stasUpdateHashRegex = /^(76a914)([a-z0-9]{40})*(88ac697[a-z0-9]*)/

function handleChange (tx, publicKey) {
  // In this implementation, we will always add a change output...

  // Create a change output. The satoshi amount will be updated after we calculate the fees.
  // ---------------------------------------------------------------------------------------
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex')

  const changeScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  tx.addOutput(new bsv.Transaction.Output({
    script: changeScript,
    satoshis: 0
  }))

  // Now we need to calculate the preimage of the transaction.  This will become part of the unlocking script
  // and therefore increases the size and cost of the overall TX.
  const image = preimage(tx, sighash, 0, tx.inputs[0].output.script, tx.inputs[0].output.satoshisBN)

  const preimageLen = new Varint().fromNumber(image.buf.length).toBuffer().length

  // Calculate the fee required
  // ---------------------------------------------------------------------------------------
  // The actual unlocking script for STAS will be:
  // STAS amount + pubkeyhash (max 28 bytes)           2 or up to 30 bytes
  // OP_FALSE OP_FALSE (2 bytes)                       2 or up to 30 bytes
  // Amount of change + pubkeyhash (max 28 bytes)      2 or up to 39 bytes
  // Output funding index                              up to 9 bytes
  //  0x14 + Funding txid                              33 bytes
  // OP_PUSH(<len(preimage)                            preimageLen
  // Preimage (len(preimage)                           len(preimage)
  // OP_PUSH_72                                           1 byte
  // <signature> DER-encoded signature (70-72 bytes) -   72 bytes
  // OP_PUSH_33                                           1 byte
  // <public key> - compressed SEC-encoded public key  - 33 bytes

  // Calculate the fees required...
  // Of the 3 outputs they will always have minimum OP_FALSE OF_FALSE (2 bytes) hence 2 x 3 = 6.  If there is an output it could take up 28 more bytes...
  let txSizeInBytes = tx.toBuffer().length + 6 + (tx.outputs.length * 28) + 9 + 33 + preimageLen + image.buf.length + 1 + 72 + 1 + 33
  txSizeInBytes += ((tx.inputs.length - 1) * P2PKH_UNLOCKING_SCRIPT_BYTES)

  let satoshis = 0
  tx.inputs.forEach((input, i) => {
    if (i > 0) { // Skip the STAS input...
      satoshis += input.output.satoshis
    }
  })

  const fee = Math.ceil(txSizeInBytes * SATS / PERBYTE)
  if (fee > satoshis) {
    throw new Error(`Fees ${fee} is greater than input ${satoshis}`)
  }
  tx.outputs[tx.outputs.length - 1].satoshis = satoshis - fee
}

// completeSTASUnlockingScript takes a bitcoin transaction where the 1st input is a STAS UTXO which has been signed
// as a standard P2PKH script, and prepends the necessary scripts to complete the STAS unlocking script...
// A STAS locking script is made up of 3 satoshi/public key hash "segments" where the 2nd and 3rd can be nil.
// Nil segments are filled with a pair of OP_FALSE opcodes.
function completeSTASUnlockingScript (tx, segments, sigStr, pubKeyStr, version, isZeroFee) {
  if (tx.inputs.length < 1) {
    throw new Error('There must be at least 1 input')
  }

  if (!tx.inputs[0].script) {
    throw new Error('First input must be signed')
  }

  if (segments.length > 5) {
    throw new Error('Must have less than 5 segments')
  }

  // Build the STAS unlocking script.
  // ---------------------------------------------------------------------------------------
  let script = ' '

  segments.forEach(segment => {
    if (segment) {
      if (segment.satoshis <= 16) {
        script += 'OP_' + segment.satoshis
        script += ' '
        script += Buffer.from(segment.publicKey)
        script += ' '
      } else {
        script += numberToLESM(segment.satoshis)
        script += ' '
        script += Buffer.from(segment.publicKey)
        script += ' '
      }
    }
  })

  script = script.trim()

  if (version === 2) {
    // may not exist
    if (isZeroFee) {
      // no funding input
      script += ' OP_FALSE'
      script += ' '
      script += 'OP_FALSE'
      // no change output
      script += ' OP_FALSE'
      script += ' '
      script += 'OP_FALSE'
    } else {
      const outpointFundingIndex = tx.inputs[tx.inputs.length - 1].outputIndex
      const reversedFundingTXID = reverseEndian(tx.inputs[tx.inputs.length - 1].prevTxId)

      if (outpointFundingIndex <= 16) {
        script += ' OP_' + outpointFundingIndex
      } else {
        script += ' ' + numberToLESM(outpointFundingIndex)
      }
      script += ' ' + Buffer.from(reversedFundingTXID)
    }
    // console.log('outpointFundingIndex', outpointFundingIndex)
    // const reverseFundingTXID, _ := hex.DecodeString(reverseEndian(tx.Inputs[tx.InputCount()-1].PreviousTxID))
    // add funding index and reverse tx id
    // if
  }

  // If v2 of script, we need to add extra data
  // OP_0 = Basic
  // OP_1 = SWAP (for the future)
  // OP_2 - OP_5 = MERGE with tx "cuts" added to unlocking script
  if (version === 2) {
    script += ' OP_0'
  }

  script += ' ' + preimage(tx, sighash, 0, tx.inputs[0].output.script, tx.inputs[0].output.satoshisBN).buf.toString('hex')

  script += ' '
  script += sigStr + ' ' + pubKeyStr

  tx.inputs[0].setScript(bsv.Script.fromASM(script))
}

// getStasScript adds the destination public key hash and redemption public key hash (token id)
// to the appropriate version of STAS script
// only add hex encoded data to version one of script
function getStasScript (destinationPublicKeyHash, redemptionPublicKey, data, isSplittable, symbol) {
  const redemptionPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(redemptionPublicKey.toBuffer()).toString('hex')

  let script = stasV2.replace('[destinationPublicKeyHash]', destinationPublicKeyHash).replace('[redemptionPublicKeyHash]', redemptionPublicKeyHash)
  let asm = ''
  if (isSplittable) {
    asm += '00'
  } else {
    asm += '01'
  }
  // add the symbol
  if (symbol) {
    asm += ` ${symbol}`
  }
  if (data) {
    asm += ` ${data}`
  }
  const s = bsv.Script.fromASM(asm)
  const h = s.toHex()
  script += h
  return script
}

// updates a stas script with a new destination public key hash
function updateStasScript (destinationPublicKeyHash, stasScript) {
  if (stasScript.match(stasUpdateHashRegex) === null) {
    throw new Error('Invalid STAS script')
  }
  return stasScript.replace(stasUpdateHashRegex, `$1${destinationPublicKeyHash}$3`)
}

function getScriptData (script, version) {
  const b = bsv.Script.fromHex(script).toASM()

  const res = b.toString().match(stasV2DataRegex)
  if (res && res.length > 3) {
    return res[3]
  }
  return null
}

function getScriptFlags (script) {
  const b = bsv.Script.fromHex(script).toASM()
  const res = b.toString().match(stasV2DataRegex)
  if (res && res.length > 1) {
    return res[1]
  }
  return null
}

function getSymbol (script) {
  const b = bsv.Script.fromHex(script).toASM()
  const res = b.toString().match(stasV2DataRegex)
  if (res && res.length > 2) {
    return res[2].trim()
  }
  return null
}

function isSplittable (script) {
  let isSplittable = true
  const flags = getScriptFlags(script)
  if (flags === '01') {
    isSplittable = false
  }
  return isSplittable
}

function getVersion (script) {
  if (stasV2Regex.test(script)) {
    return 2
  }

  return 0
}

function isStasScript (script) {
  if (stasV2Regex.test(script)) {
    return true
  }
  return false
}

function validateSymbol (symbol) {
  if (symbol === null) {
    return false
  }
  if (symbol.length < MIN_SYMBOL_SIZE || symbol.length > MAX_SYMBOL_SIZE) {
    return false
  }
  const reg = /^[\w-]+$/
  const a = reg.test(symbol)

  return a
}

function validateSplitDestinations (splitDestinations) {
  splitDestinations.forEach(sd => {
    if (sd.address === null || sd.address === '') {
      throw new Error('Invalid address in split destination')
    }
    try {
      bsv.Address.fromString(sd.address)
    } catch (e) {
      throw new Error('Invalid Address in split destination')
    }
    if (sd.amount <= 0) {
      throw new Error('Invalid ammount in split destination')
    }
  })
  return true
}

const p2pkhRegexStr = '^76a914[0-9a-fA-F]{40}88ac$'
const p2pkhRegex = new RegExp(p2pkhRegexStr)
const sighash = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID

/*
The maker provides, or publishes publically to anyone interested,
a partial transaction including his/her input-output pair, with a signature (related to the ownership relay)
in input’s unlocking script signed with ‘SINGLE | ANYONECANPAY’ flags
makerInputUtxo: the utxo the maker is offering to swap
wantedInfo: the script and amount the maker wants for the mmakerInputUtxo.
*/
function createSwapOffer (makerPrivateKey, makerInputUTXO, wantedInfo) {
//   console.log('creating swap offer')
  if (makerPrivateKey === null) {
    throw new Error('Maker private key is null')
  }
  if (makerInputUTXO === null) {
    throw new Error('Maker input UTXO is null')
  } else if (makerInputUTXO.satoshis < 0 || makerInputUTXO.script === '' || makerInputUTXO.outputIndex < 0 || makerInputUTXO.txId === '') {
    throw new Error('Invalid maker input UTXO')
  }
  if (typeof makerInputUTXO.script !== 'object') {
    throw new Error('makerInputUtxo.script must be an object')
  }
  const makerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(makerPrivateKey.publicKey.toBuffer()).toString('hex')
  const wantedType = (wantedInfo.type !== undefined && wantedInfo.type === 'native') ? 'native' : 'token'

  // the makers offered input
  const tx = new bsv.Transaction().from(makerInputUTXO)

  let makerWantedLockingScript
  if (wantedType === 'token') {
    // console.log('creating maker token output script')
    const wantedScriptAsm = bsv.Script.fromHex(wantedInfo.scriptHex).toString()
    const wantedSlice1 = wantedScriptAsm.slice(0, 23)
    const wantedSlice2 = wantedScriptAsm.slice(63)
    const makerWantedScriptAsm = wantedSlice1.concat(makerPublicKeyHash).concat(wantedSlice2)
    const makerWantedScript = bsv.Script.fromString(makerWantedScriptAsm).toHex()
    makerWantedLockingScript = bsv.Script.fromHex(makerWantedScript)
  } else {
    // console.log('creating maker p2pkh output script')
    makerWantedLockingScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${makerPublicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  }

  // the makers wanted output
  tx.addOutput(new bsv.Transaction.Output({
    script: makerWantedLockingScript,
    satoshis: wantedInfo.satoshis
  }))

  const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES
  const sighashSingleAnyoneCanPay = bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_ANYONECANPAY | bsv.crypto.Signature.SIGHASH_FORKID
  //   const sighash = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID

  const isMakerOutputStasScript = isStasScript(makerInputUTXO.script.toHex())

  let makerUnlockScript
  if (isMakerOutputStasScript) {
    // console.log('creating maker stas unlocking script')

    const makerSignature = bsv.Transaction.sighash.sign(tx, makerPrivateKey, sighashSingleAnyoneCanPay, 0, makerInputUTXO.script, new bsv.crypto.BN(makerInputUTXO.satoshis), flags)
    const makerSignatureHex = makerSignature.toTxFormat().toString('hex')
    makerUnlockScript = bsv.Script.fromASM(makerSignatureHex + ' ' + makerPrivateKey.publicKey.toString('hex'))
  } else {
    // console.log('creating maker p2pkh unlocking script')
    const makerSignature = bsv.Transaction.sighash.sign(tx, makerPrivateKey, sighashSingleAnyoneCanPay, 0, makerInputUTXO.script, new bsv.crypto.BN(makerInputUTXO.satoshis), flags)
    const makerSignatureASM = makerSignature.toTxFormat().toString('hex')
    makerUnlockScript = bsv.Script.fromASM(makerSignatureASM + ' ' + makerPrivateKey.publicKey.toString('hex'))
  }

  tx.inputs[0].setScript(makerUnlockScript)

  return tx.serialize(true)
}

/*

    You can swap two tokens, a token for satoshis or satoshis for a token.
    How does it work?
    There are 2 players:
    1. The maker initiates the swap
    2. The taker accepts the swap

    For the token-token swap there are 3 steps.
    1. The maker creates an unsigned tx containing the output he wants and the input he's offering.
        He publishes this somewhere.
    2. The taker adds an input which matches the makers output, and an output that matches the makers input.
        He also adds the funding tx.
        He returns this tx to the maker.
    3. The maker signs the tx and submits it to the blockchain

    At a lower level the taker signs for each of the rest of the transaction inputs (both funding and
    spending ones of standard P2PKH type) with ‘ALL’ flag, and completes the 3 missing linking fields
    in the preimage pushed into unlocking script of maker’s input with exactly the same values as in
    the preimage of his spending input, then completes the unlocking script parameters of unlocking
    script of maker’s input either needed to be parsed and used for swapped forward-persistence
    enforcement or simply part of concatenation for verification of others,
*/

/*
    offerTxHex: the offer tx created in createSwapOffer()
    -
    makerInputTxHex: the whole tx hex containing the output the maker is offering
    -
    takerInputTxHex: the whole tx hex containing the output the taker is offering
    takerInputUtxo: the utxo the taker is offering
 */
function acceptSwapOffer (offerTxHex, makerInputTxHex,
  takerPrivateKey, takerInputTxHex, takerInputUTXO, takerOutputSatoshis, makerPublicKeyHash, paymentUtxo, paymentPrivateKey) {
//   console.log('accepting swap offer')
  // this is the makers offer tx
  const tx = new bsv.Transaction(offerTxHex)
  const makerInputTx = new bsv.Transaction(makerInputTxHex)
  const makerInputVout = tx.inputs[0].outputIndex

  const takerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(takerPrivateKey.publicKey.toBuffer()).toString('hex')
  const paymentPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPrivateKey.publicKey.toBuffer()).toString('hex')

  const makerInputScript = makerInputTx.outputs[makerInputVout].script
  const makerInputScriptASM = makerInputScript.toString()

  const takerInputTx = bsv.Transaction(takerInputTxHex)

  const takerInputScript = takerInputTx.outputs[takerInputUTXO.outputIndex].script

  const takerInputTxid = bsv.Transaction(takerInputTx).hash

  const makerSlice1 = makerInputScriptASM.slice(0, 23)
  const makerSlice2 = makerInputScriptASM.slice(63)
  const takerWantedScriptAsm = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
  const takerWantedScript = bsv.Script.fromString(takerWantedScriptAsm)

  const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES

  //   const takerWantedScript = bsv.Script.fromHex(takerWantedScriptHex)

  const isTakerInputStasScript = isStasScript(takerInputScript.toHex())
  const isMakerInputStasScript = isStasScript(makerInputScript.toHex())

  // add taker input
  tx.addInput(new bsv.Transaction.Input({
    prevTxId: takerInputTxid,
    outputIndex: takerInputUTXO.outputIndex,
    script: takerInputScript
  }), takerInputScript, takerInputUTXO.satoshis)

  // add taker output
  tx.addOutput(new bsv.Transaction.Output({
    script: takerWantedScript,
    satoshis: takerOutputSatoshis
  }))

  // add funding input
  tx.addInput(new bsv.Transaction.Input({
    prevTxId: paymentUtxo.txid,
    outputIndex: paymentUtxo.vout,
    script: bsv.Script.fromHex(paymentUtxo.scriptPubKey)
  }), paymentUtxo.scriptPubKey, paymentUtxo.amount)

  // add change
  const extraBytesForPieces = makerInputTxHex.length + takerInputTxHex.length
  handleChangeForSwap(tx, extraBytesForPieces, paymentPrivateKey.publicKey)

  const publicKeyTaker = takerPrivateKey.publicKey

  const preimageTakerBuf = preimageFn(tx, sighash, 1, takerInputScript, new bsv.crypto.BN(takerInputUTXO.satoshis))
  const preimageTaker = preimageTakerBuf.buf.toString('hex')

  const takerSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, takerInputScript, new bsv.crypto.BN(takerInputUTXO.satoshis), flags)
  const takerSignatureASM = takerSignature.toTxFormat().toString('hex')

  const reversedFundingTXID = reverseEndian(paymentUtxo.txid)
  // taker completes the 3 missing linking fields in the preimage pushed into unlocking script of maker’s input
  // with exactly the same values as in the preimage of his spending input
  if (isMakerInputStasScript) {
    // console.log('maker input is stas script')
    const preimageMakerBuf = preimageFn(tx, sighash, 0, makerInputScript, new bsv.crypto.BN(takerOutputSatoshis), flags)
    const preimageMaker = preimageMakerBuf.buf.toString('hex')

    const makerUnlockScript = bsv.Script.fromASM(
      numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
            ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
            ' ' + `OP_${takerInputUTXO.outputIndex}` +
            ' ' + takerInputTxHex + ' ' + 'OP_1' +
            ' ' + preimageMaker)
    makerUnlockScript.add(tx.inputs[0].script)

    tx.inputs[0].setScript(makerUnlockScript)
  }

  let takerUnlockScript
  if (isTakerInputStasScript) {
    // console.log('creating taker stas ulocking script')
    takerUnlockScript = bsv.Script.fromASM(
      numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
            ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
            ' ' + `OP_${makerInputVout}` + // an index of output of that tx, which is attempted to be spent by an input of current spending tx
            ' ' + makerInputTxHex +
            ' ' + 'OP_1' + // type of TX: basic, swap or merging
            ' ' + preimageTaker +
            ' ' + takerSignatureASM + ' ' + publicKeyTaker.toString('hex'))
  } else if (isP2PKHScript(takerInputScript.toHex())) {
    // console.log('creating taker p2pkh unlocking script')
    const takerSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, takerInputScript, new bsv.crypto.BN(takerInputUTXO.satoshis), flags)
    const takerSignatureASM = takerSignature.toTxFormat().toString('hex')
    takerUnlockScript = bsv.Script.fromASM(takerSignatureASM + ' ' + takerPrivateKey.publicKey.toString('hex'))
  }

  const paymentSignature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, 2, paymentUtxo.scriptPubKey, new bsv.crypto.BN(paymentUtxo.amount), flags)
  const paymentSignatureASM = paymentSignature.toTxFormat().toString('hex')
  const paymentUnlockScript = bsv.Script.fromASM(paymentSignatureASM + ' ' + paymentPrivateKey.publicKey.toString('hex'))

  tx.inputs[1].setScript(takerUnlockScript)
  tx.inputs[2].setScript(paymentUnlockScript)

  return tx.serialize(true)
}

/*
The maker provides, or publishes publically to anyone interested,
an unsigned partial transaction including his/her input-output pair
*/
function createUnsignedSwapOffer (makerPrivateKey, makerInputUTXO, wantedInfo) {
  if (wantedInfo.type !== undefined && wantedInfo.type !== 'native') {
    throw new Error('wantedInfo.type must be undefined or "native"')
  }

  const makerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(makerPrivateKey.publicKey.toBuffer()).toString('hex')
  const wantedType = (wantedInfo.type !== undefined && wantedInfo.type === 'native') ? 'native' : 'token'

  // the makers offered input
  const tx = new bsv.Transaction().from(makerInputUTXO)

  let makerWantedLockingScript
  if (wantedType === 'token') {
    const wantedScriptAsm = bsv.Script.fromHex(wantedInfo.scriptHex).toString()
    const wantedSlice1 = wantedScriptAsm.slice(0, 23)
    const wantedSlice2 = wantedScriptAsm.slice(63)
    const makerWantedScriptAsm = wantedSlice1.concat(makerPublicKeyHash).concat(wantedSlice2)
    const makerWantedScript = bsv.Script.fromString(makerWantedScriptAsm).toHex()
    makerWantedLockingScript = bsv.Script.fromHex(makerWantedScript)
  } else {
    makerWantedLockingScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${makerPublicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  }
  tx.addOutput(new bsv.Transaction.Output({
    script: makerWantedLockingScript,
    satoshis: wantedInfo.satoshis
  }))

  return tx.serialize(true)
}

function acceptUnsignedSwapOffer (offerTxHex, makerInputTxHex,
  takerPrivateKey, takerInputTxHex, takerInputVout, takerInputSatoshis, takerOutputSatoshis, makerPublicKeyHash, paymentUtxo, paymentPrivateKey) {
//   console.log('accepting unsigned swap offer')
  // this is the offer tx
  const tx = new bsv.Transaction(offerTxHex)
  const makerInputTx = new bsv.Transaction(makerInputTxHex)
  const makerInputVout = tx.inputs[0].outputIndex

  const makerOutputSatoshis = tx.outputs[0].satoshis

  const takerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(takerPrivateKey.publicKey.toBuffer()).toString('hex')

  const paymentPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPrivateKey.publicKey.toBuffer()).toString('hex')
  const makerStasInputScript = makerInputTx.outputs[makerInputVout].script
  const makerStasInputScriptASM = makerStasInputScript.toString()

  const takerInputTx = bsv.Transaction(takerInputTxHex)
  const takerOutputScript = takerInputTx.outputs[takerInputVout].script

  const takerInputTxid = bsv.Transaction(takerInputTx).hash

  const isTakerOutputStasScript = isStasScript(takerOutputScript.toHex())

  // if tx.outputs[0] is a p2pkh then we need to add an appropriate input
  let takerWantedScript
  if (isTakerOutputStasScript) {
    const makerSlice1 = makerStasInputScriptASM.slice(0, 23)
    const makerSlice2 = makerStasInputScriptASM.slice(63)
    const takerWantedScriptAsm = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
    takerWantedScript = bsv.Script.fromString(takerWantedScriptAsm).toHex()
  } else if (isP2PKHScript(takerOutputScript.toHex())) {
    const makerSlice1 = makerInputTx.outputs[makerInputVout].script.slice(0, 6)
    const makerSlice2 = makerInputTx.outputs[makerInputVout].script.slice(46)
    takerWantedScript = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
  }

  const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES

  const lockingScriptSplit = bsv.Script.fromHex(takerWantedScript)

  const takerInput = new bsv.Transaction.Input({
    prevTxId: takerInputTxid,
    outputIndex: takerInputVout,
    script: takerOutputScript
  })

  tx.addInput(takerInput, takerOutputScript, takerInputSatoshis)

  // add taker output - wrong
  tx.addOutput(new bsv.Transaction.Output({
    script: lockingScriptSplit,
    satoshis: takerOutputSatoshis
  }))

  // add funding
  tx.addInput(new bsv.Transaction.Input({
    prevTxId: paymentUtxo.txid,
    outputIndex: paymentUtxo.vout,
    script: bsv.Script.fromHex(paymentUtxo.scriptPubKey)
  }), paymentUtxo.scriptPubKey, paymentUtxo.amount)

  // add change
  const extraBytesForPieces = makerInputTxHex.length + takerInputTxHex.length
  handleChangeForSwap(tx, extraBytesForPieces, paymentPrivateKey.publicKey)

  const reversedFundingTXID = reverseEndian(paymentUtxo.txid)

  const publicKeyTaker = takerPrivateKey.publicKey

  const preimageTakerBuf = preimageFn(tx, sighash, 1, takerOutputScript, new bsv.crypto.BN(takerInputSatoshis))
  const preimageTaker = preimageTakerBuf.buf.toString('hex')

  const takerSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, takerOutputScript, new bsv.crypto.BN(takerInputSatoshis), flags)
  const takerSignatureASM = takerSignature.toTxFormat().toString('hex')
  let takerUnlockScript

  if (isTakerOutputStasScript) {
    // console.log('creating stas takerUnlockScript')
    takerUnlockScript = bsv.Script.fromASM(
      numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
            ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
            ' ' + `OP_${makerInputVout}` + // an index of output of that tx, which is attempted to be spent by an input of current spending tx
            ' ' + makerInputTxHex +
            ' ' + 'OP_1' + // type of TX: basic, swap or merging
            ' ' + preimageTaker +
            ' ' + takerSignatureASM + ' ' + publicKeyTaker.toString('hex'))
  } else if (isP2PKHScript(takerOutputScript.toHex())) {
    // console.log('maker script is p2pkh')
    const takerP2pkhSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, makerStasInputScript, new bsv.crypto.BN(makerOutputSatoshis), flags)
    const takerP2pkhSignatureASM = takerP2pkhSignature.toTxFormat().toString('hex')

    takerUnlockScript = bsv.Script.fromASM(takerP2pkhSignatureASM + ' ' + takerPrivateKey.publicKey.toString('hex'))
  }

  const paymentSignature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, 2, paymentUtxo.scriptPubKey, new bsv.crypto.BN(paymentUtxo.amount), flags)
  const paymentSignatureASM = paymentSignature.toTxFormat().toString('hex')

  const paymentUnlockScript = bsv.Script.fromASM(paymentSignatureASM + ' ' + paymentPrivateKey.publicKey.toString('hex'))

  //   tx.inputs[0].setScript(unlockScript1)
  tx.inputs[1].setScript(takerUnlockScript)
  tx.inputs[2].setScript(paymentUnlockScript)

  return tx.serialize(true)
}

// here the taker is supplying a p2pkh utxo
function acceptUnsignedNativeSwapOffer (offerTxHex, takerInputInfo, makerInputTxHex,
  takerPrivateKey, takerInputTxHex, takerInputVout, takerOutputSatoshis, makerPublicKeyHash, paymentUtxo, paymentPrivateKey) {
//   console.log('accepting unsigned swap offer')
  // this is the offer tx
  const tx = new bsv.Transaction(offerTxHex)
  const makerInputVout = tx.inputs[0].outputIndex

  const makerInputTx = new bsv.Transaction(makerInputTxHex)
  //   console.log('takerOutputSatoshis: ', takerOutputSatoshis)

  const takerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(takerPrivateKey.publicKey.toBuffer()).toString('hex')

  //   const makerInputTx = JSON.parse(JSON.stringify(bsv.Transaction(makerInputTxHex)))
  const makerStasInputScript = makerInputTx.outputs[makerInputVout].script
  const makerStasInputScriptASM = makerStasInputScript.toString()

  const takerInputTx = bsv.Transaction(takerInputTxHex)

  const takerOutputScript = takerInputTx.outputs[takerInputVout].script

  //   const inputType = (takerInputInfo.type !== undefined && takerInputInfo.type === 'native') ? 'native' : 'token'

  //   const isMakerInputStasScript = isStasScript(makerStasInputScript.toHex())
  const isTakerOutputStasScript = isStasScript(takerOutputScript.toHex())

  // if tx.outputs[0] is a p2pkh then we need to add an appropriate input
  let takerWantedScript
  if (isTakerOutputStasScript) {
    const makerSlice1 = makerStasInputScriptASM.slice(0, 23)
    const makerSlice2 = makerStasInputScriptASM.slice(63)
    const takerWantedScriptAsm = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
    takerWantedScript = bsv.Script.fromString(takerWantedScriptAsm).toHex()
  } else if (isP2PKHScript(takerOutputScript.toHex())) {
    const makerSlice1 = makerInputTx.outputs[makerInputVout].script.toHex().slice(0, 6)
    const makerSlice2 = makerInputTx.outputs[makerInputVout].script.toHex().slice(46)
    takerWantedScript = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
  }

  const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES

  const lockingScriptSplit = bsv.Script.fromHex(takerWantedScript)

  // add taker input
  tx.from(takerInputInfo.utxo)

  // add taker output - wrong
  tx.addOutput(new bsv.Transaction.Output({
    script: lockingScriptSplit,
    satoshis: takerOutputSatoshis
  }))

  // add funding
  tx.addInput(new bsv.Transaction.Input({
    prevTxId: paymentUtxo.txid,
    outputIndex: paymentUtxo.vout,
    script: bsv.Script.fromHex(paymentUtxo.scriptPubKey)
  }), paymentUtxo.scriptPubKey, paymentUtxo.amount)

  // add change
  const extraBytesForPieces = makerInputTxHex.length + takerInputTxHex.length
  handleChangeForSwap(tx, extraBytesForPieces, paymentPrivateKey.publicKey)
  const takerSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, takerInputInfo.utxo.scriptPubKey, new bsv.crypto.BN(Math.floor(takerInputInfo.utxo.amount * 1E8)), flags)
  const takerSignatureASM = takerSignature.toTxFormat().toString('hex')
  const takerUnlockScript = bsv.Script.fromASM(takerSignatureASM + ' ' + takerPrivateKey.publicKey.toString('hex'))

  const paymentSignature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, 2, paymentUtxo.scriptPubKey, new bsv.crypto.BN(paymentUtxo.amount), flags)
  const paymentSignatureASM = paymentSignature.toTxFormat().toString('hex')
  const paymentUnlockScript = bsv.Script.fromASM(paymentSignatureASM + ' ' + paymentPrivateKey.publicKey.toString('hex'))

  tx.inputs[1].setScript(takerUnlockScript)
  tx.inputs[2].setScript(paymentUnlockScript)

  return tx.serialize(true)
}

function makerSignSwapOffer (offerTxHex, makerInputTxHex, takerInputTx, makerPrivateKey, takerPublicKeyHash, paymentPublicKeyHash, paymentUtxo) {
  const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES

  // partially signed tx
  const tx = bsv.Transaction(offerTxHex)
  const makerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(makerPrivateKey.publicKey.toBuffer()).toString('hex')
  const makerInputTx = bsv.Transaction(makerInputTxHex)
  const makerInputVout = tx.inputs[0].outputIndex
  const takerInputVout = tx.inputs[1].outputIndex
  const makerOutputScript = makerInputTx.outputs[makerInputVout].script

  const isMakerOutputStasScript = isStasScript(makerOutputScript.toHex())

  const preimageMakerBuf = preimageFn(tx, sighash, 0, makerOutputScript, new bsv.crypto.BN(tx.outputs[1].satoshis))
  const preimageMaker = preimageMakerBuf.buf.toString('hex')
  const makerSignature = bsv.Transaction.sighash.sign(tx, makerPrivateKey, sighash, 0, makerOutputScript, new bsv.crypto.BN(tx.outputs[1].satoshis), flags)
  const makerSignatureASM = makerSignature.toTxFormat().toString('hex')

  const reversedFundingTXID = reverseEndian(paymentUtxo.txid)

  let makerUnlockScript
  if (isMakerOutputStasScript) {
    makerUnlockScript = bsv.Script.fromASM(
      numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
            ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
            ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
            ' ' + `OP_${takerInputVout}` +
            ' ' + takerInputTx + ' ' + 'OP_1' + ' ' + // type of TX: basic, swap or merging
            preimageMaker + ' ' + makerSignatureASM + ' ' + makerPrivateKey.publicKey.toString('hex'))
  } else {
    const makerSignature = bsv.Transaction.sighash.sign(tx, makerPrivateKey, sighash, 0, makerInputTx.outputs[makerInputVout].script, new bsv.crypto.BN(tx.outputs[1].satoshis), flags)
    const makerSignatureASM = makerSignature.toTxFormat().toString('hex')
    makerUnlockScript = bsv.Script.fromASM(makerSignatureASM + ' ' + makerPrivateKey.publicKey.toString('hex'))
  }
  tx.inputs[0].setScript(makerUnlockScript)

  return tx.serialize(true)
}

/*
Depricated: don't use allInOneSwap
*/
function allInOneSwap (makerPrivateKey, makerInputUtxo, wantedInfo, makerInputTxHex, makerInputVout,
  takerPrivateKey, takerInputTxHex, takerInputVout, takerInputSatoshis, takerOutputSatoshis, paymentUtxo, paymentPrivateKey) {
//   console.log('allInOneSwap')
//   console.log('makerInputSatoshis: ', makerInputUtxo.satoshis)
//   console.log('takerOutputSatoshis: ', takerOutputSatoshis)
//   console.log('makerOutputSatoshis: ', wantedInfo.satoshis)
//   console.log('takerInputSatoshis: ', takerInputSatoshis)
  if (makerPrivateKey === null) {
    throw new Error('Maker private key is null')
  }
  if (takerPrivateKey === null) {
    throw new Error('Taker private key is null')
  }
  if (makerInputUtxo === null) {
    throw new Error('Maker input UTXO is null')
  } else if (makerInputUtxo.satoshis < 0 || makerInputUtxo.script === '' || makerInputUtxo.outputIndex < 0 || makerInputUtxo.txId === '') {
    throw new Error('Invalid maker input UTXO')
  }
  if (typeof makerInputUtxo.script !== 'object') {
    throw new Error('makerInputUtxo.script must be an object')
  }
  if (makerInputUtxo.satoshis !== takerOutputSatoshis) {
    throw new Error('makerInputUtxo.satoshis should equal takerOutputSatoshis')
  }
  if (wantedInfo.satoshis !== takerInputSatoshis) {
    throw new Error('wantedInfo.satoshis should equal takerInputSatoshis')
  }

  if (makerInputTxHex === null || makerInputTxHex.length < 100) {
    throw new Error('Invalid makerInputTxHex')
  }
  if (takerInputTxHex === null || takerInputTxHex.length < 100) {
    throw new Error('Invalid takerInputTxHex')
  }
  if (paymentUtxo.txid === null || typeof paymentUtxo.txid.length < 1) {
    throw new Error('paymentUtxo.txid must be a string')
  }
  if (paymentUtxo.scriptPubKey === null || typeof paymentUtxo.scriptPubKey !== 'string') {
    throw new Error('paymentUtxo.scriptPubKey must be a string')
  }

  const makerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(makerPrivateKey.publicKey.toBuffer()).toString('hex')
  const takerPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(takerPrivateKey.publicKey.toBuffer()).toString('hex')
  const paymentPublicKeyHash = bsv.crypto.Hash.sha256ripemd160(paymentPrivateKey.publicKey.toBuffer()).toString('hex')

  const wantedScriptAsm = bsv.Script.fromHex(wantedInfo.scriptHex).toString()

  const wantedSlice1 = wantedScriptAsm.slice(0, 23)
  const wantedSlice2 = wantedScriptAsm.slice(63)
  const makerWantedScriptAsm = wantedSlice1.concat(makerPublicKeyHash).concat(wantedSlice2)
  const makerWantedScript = bsv.Script.fromString(makerWantedScriptAsm).toHex()
  const makerWantedLockingScript = bsv.Script.fromHex(makerWantedScript)

  // the makers offered input
  const tx = new bsv.Transaction().from(makerInputUtxo)

  // the makers wanted output
  tx.addOutput(new bsv.Transaction.Output({
    script: makerWantedLockingScript,
    satoshis: wantedInfo.satoshis
  }))

  const makerInputTx = JSON.parse(JSON.stringify(bsv.Transaction(makerInputTxHex)))
  const makerStasInputScript = bsv.Script.fromHex(makerInputTx.outputs[makerInputVout].script)
  const makerStasInputScriptASM = makerStasInputScript.toString()

  const takerInputTx = bsv.Transaction(takerInputTxHex)
  const takerStasInputScript = takerInputTx.outputs[takerInputVout].script

  const takerInputTxid = bsv.Transaction(takerInputTx).hash

  const makerSlice1 = makerStasInputScriptASM.slice(0, 23)
  const makerSlice2 = makerStasInputScriptASM.slice(63)
  const takerWantedScriptAsm = makerSlice1.concat(takerPublicKeyHash).concat(makerSlice2)
  const takerWantedScript = bsv.Script.fromString(takerWantedScriptAsm)// .toHex()

  tx.addInput(new bsv.Transaction.Input({
    prevTxId: takerInputTxid,
    outputIndex: takerInputVout,
    script: takerStasInputScript
  }), takerStasInputScript, takerInputSatoshis)

  // add taker output
  tx.addOutput(new bsv.Transaction.Output({
    script: takerWantedScript,
    satoshis: takerOutputSatoshis
  }))

  // add funding
  tx.addInput(new bsv.Transaction.Input({
    prevTxId: paymentUtxo.txid,
    outputIndex: paymentUtxo.vout,
    script: bsv.Script.fromHex(paymentUtxo.scriptPubKey)
  }), paymentUtxo.scriptPubKey, paymentUtxo.amount)

  // add change
  const extraBytesForPieces = makerInputTxHex.length + takerInputTxHex.length
  handleChangeForSwap(tx, extraBytesForPieces, paymentPrivateKey.publicKey)

  const preimageBuf = preimageFn(tx, sighash, 0, makerInputUtxo.script, new bsv.crypto.BN(makerInputUtxo.satoshis))
  const preimage = preimageBuf.buf.toString('hex')
  const sigSmart = bsv.Transaction.sighash.sign(tx, makerPrivateKey, sighash, 0, makerInputUtxo.script, new bsv.crypto.BN(makerInputUtxo.satoshis))
  const sigSmartHex = sigSmart.toTxFormat().toString('hex')

  const preimageTakerBuf = preimageFn(tx, sighash, 1, takerStasInputScript, new bsv.crypto.BN(takerInputSatoshis))
  const preimageTaker = preimageTakerBuf.buf.toString('hex')
  const takerSignature = bsv.Transaction.sighash.sign(tx, takerPrivateKey, sighash, 1, takerStasInputScript, new bsv.crypto.BN(takerInputSatoshis))
  const takerSignatureHex = takerSignature.toTxFormat().toString('hex')

  const paymentSignature = bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, 2, bsv.Script.fromHex(paymentUtxo.scriptPubKey), new bsv.crypto.BN(paymentUtxo.amount))
  const paymentSignatureHex = paymentSignature.toTxFormat().toString('hex')

  const reversedFundingTXID = reverseEndian(paymentUtxo.txid)

  // taker completes the 3 missing linking fields in the preimage pushed into unlocking script of maker’s input
  // with exactly the same values as in the preimage of his spending input
  const makerUnlockScript = bsv.Script.fromASM(
    numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
        ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
        ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
        ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
        ' ' + `OP_${takerInputVout}` +
        ' ' + takerInputTxHex + ' ' + 'OP_1' + ' ' + // type of TX: basic, swap or merging
        preimage + ' ' + sigSmartHex + ' ' + makerPrivateKey.publicKey.toString('hex'))

  const publicKeyTaker = takerPrivateKey.publicKey
  const publicKeyPayment = paymentPrivateKey.publicKey

  // type of TX: basic, swap or merging
  const takerUnlockScript = bsv.Script.fromASM(
    numberToLESM(tx.outputs[0].satoshis) + ' ' + makerPublicKeyHash +
        ' ' + numberToLESM(tx.outputs[1].satoshis) + ' ' + takerPublicKeyHash +
        ' ' + numberToLESM(tx.outputs[2].satoshis) + ' ' + paymentPublicKeyHash +
        ' ' + `OP_${paymentUtxo.vout}` + ' ' + reversedFundingTXID +
        ' ' + `OP_${makerInputVout}` + // an index of output of that tx, which is attempted to be spent by an input of current spending tx
        ' ' + makerInputTxHex + ' ' + 'OP_1' + // type of TX: basic, swap or merging
        ' ' + preimageTaker + ' ' + takerSignatureHex + ' ' + publicKeyTaker.toString('hex'))

  const paymentUnlockScript = bsv.Script.fromASM(paymentSignatureHex + ' ' + publicKeyPayment.toString('hex'))

  tx.inputs[0].setScript(makerUnlockScript)
  tx.inputs[1].setScript(takerUnlockScript)
  tx.inputs[2].setScript(paymentUnlockScript)

  return tx.serialize(true)
}

function isP2PKHScript (script) {
  if (p2pkhRegex.test(script)) {
    return true
  }
  return false
}

function handleChangeForSwap (tx, extraDataBytes, publicKey) {
  // In this implementation, we will always add a change output...

  // Create a change output. The satoshi amount will be updated after we calculate the fees.
  // ---------------------------------------------------------------------------------------
  const publicKeyHash = bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex')

  const changeScript = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${publicKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
  tx.addOutput(new bsv.Transaction.Output({
    script: changeScript,
    satoshis: 0
  }))

  // Now we need to calculate the preimage of the transaction.  This will become part of the unlocking script
  // and therefore increases the size and cost of the overall TX.
  //   console.log('handleChangeForSwap: tx.inputs[0]:', tx.inputs[0])
  // we won't have the output script of tx.inputs[0].output if the maker hasn't signed yet.
  // workaround is to estimate it.
  let preimageLen = 0
  let imageBufLength = 0
  //   console.log('x.inputs[0].output', tx.inputs[0].output)
  if (tx.inputs[0].output === undefined) {
    // console.log('here: tx.outputs[0].script', tx.outputs[0].script.toHex())
    if (isStasScript(tx.outputs[0].script.toHex())) {
      preimageLen = 3206 // estimate the preimage size
    }
  } else {
    const image = preimageFn(tx, sighash, 0, tx.inputs[0].output.script, tx.inputs[0].output.satoshisBN)
    preimageLen = new Varint().fromNumber(image.buf.length).toBuffer().length
    imageBufLength = image.buf.length
  }

  //
  // Calculate the fee required
  // ---------------------------------------------------------------------------------------
  // The actual unlocking script for STAS will be:
  // STAS amount                                       Up to 9 bytes
  // pubkeyhash                                        21 bytes
  // OP_FALSE OP_FALSE OP_FALSE OP_FALSE (4 bytes)     4
  // Output funding index                              Up to 9 bytes
  // TXID                                              33 bytes
  // Output index                                      Up to 9 bytes
  // Pieces (Partly P2PSH)                             (passed in to function)
  // Size of the number of pieces                      1 byte
  // OP_PUSH(<len(preimage)                             preimageLen  // There are 2 preimages, 1 for input 0 and 1 for input 1
  // Preimage (len(preimage)                           len(preimage)
  // OP_PUSH_72                                           1 byte
  // <signature> DER-encoded signature (70-72 bytes) -   72 bytes
  // OP_PUSH_33                                           1 byte
  // <public key> - compressed SEC-encoded public key  - 33 bytes

  // Calculate the fees required...
  let txSizeInBytes = tx.toBuffer().length + 9 + 21 + 4 + 9 + 33 + 9 + extraDataBytes + ((preimageLen + imageBufLength) * 2) + 1 + 72 + 1 + 33
  txSizeInBytes += ((tx.inputs.length - 1) * P2PKH_UNLOCKING_SCRIPT_BYTES)

  let satoshis = 0
  tx.inputs.forEach((input, i) => {
    if (i > 1) { // Skip the 2 STAS inputs...
      satoshis += input.output.satoshis
    }
  })

  const fee = Math.ceil(txSizeInBytes * SATS / PERBYTE)
  console.log('handleChangeForSwap: txSizeInBytes:', txSizeInBytes)
  console.log('                   : fee:', fee)
  tx.outputs[tx.outputs.length - 1].satoshis = satoshis - fee
}

/* transfer will take an existing STAS UTXO and assign it to another address.
 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 the paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function transfer (tokenOwnerPrivateKey, stasUtxo, destinationAddress, paymentUtxo, paymentPrivateKey) {
  if (tokenOwnerPrivateKey === null) {
    throw new Error('Token owner private key is null')
  }
  const ownerSignatureCallback = (tx, i, script, satoshis) => {
    return bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, script, satoshis)
  }
  const paymentSignatureCallback = (tx, i, script, satoshis) => {
    console.log('in paymentSignatureCallback. params: i == ' + i)
    console.log('sighash == ' + sighash)
    console.log('tx == ' + tx)
    console.log('script == ' + script)
    console.log('satoshis == ' + satoshis)
    return bsv.Transaction.sighash.sign(tx, paymentPrivateKey, sighash, i, script, satoshis)
  }

  return transferWithCallback(tokenOwnerPrivateKey.publicKey, stasUtxo, destinationAddress, paymentUtxo, paymentPrivateKey ? paymentPrivateKey.publicKey : null, ownerSignatureCallback, paymentSignatureCallback)
}

/* transfer will take an existing STAS UTXO and assign it to another address.
 The tokenOwnerPrivateKey must own the existing STAS UTXO (stasUtxo),
 the paymentPrivateKey owns the paymentUtxo and will be the owner of any change from the fee.
*/
function transferWithCallback (tokenOwnerPublicKey, stasUtxo, destinationAddress, paymentUtxo, paymentPublicKey, ownerSignatureCallback, paymentSignatureCallback) {
  if (tokenOwnerPublicKey === null) {
    throw new Error('Token owner public key is null')
  }
  if (ownerSignatureCallback === null) {
    throw new Error('ownerSignatureCallback is null')
  }
  if (paymentUtxo !== null && paymentPublicKey === null) {
    throw new Error('Payment UTXO provided but payment key is null')
  }
  if (paymentUtxo === null && paymentPublicKey !== null) {
    throw new Error('Payment public key provided but payment UTXO is null')
  }

  if (stasUtxo === null) {
    throw new Error('stasUtxo is null')
  }
  if (destinationAddress === null) {
    throw new Error('destination address is null')
  }

  try {
    bsv.Address.fromString(destinationAddress)
  } catch (e) {
    throw new Error('Invalid destination address')
  }

  const isZeroFee = (paymentUtxo === null)

  const tx = new bsv.Transaction()

  const destinationPublicKey = addressToPubkeyhash(destinationAddress)

  tx.from(stasUtxo)

  if (!isZeroFee) {
    tx.from(paymentUtxo)
  }

  // Add the issuing output
  const version = getVersion(stasUtxo.scriptPubKey)

  const stasScript = updateStasScript(destinationPublicKey, stasUtxo.scriptPubKey)
  tx.addOutput(new bsv.Transaction.Output({
    script: stasScript,
    satoshis: (Math.round(stasUtxo.amount * SATS_PER_BITCOIN))
  }))

  let paymentSegment = null
  if (!isZeroFee) {
    handleChange(tx, paymentPublicKey)
    paymentSegment = {
      satoshis: tx.outputs[1].satoshis,
      publicKey: bsv.crypto.Hash.sha256ripemd160(paymentPublicKey.toBuffer()).toString('hex')
    }
  }

  tx.inputs.forEach((input, i) => {
    if (i === 0) {
      // STAS input
      // const signature = bsv.Transaction.sighash.sign(tx, tokenOwnerPrivateKey, sighash, i, input.output._script, input.output._satoshisBN)
      const signature = ownerSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)

      completeSTASUnlockingScript(
        tx,
        [
          {
            satoshis: (Math.round(stasUtxo.amount * SATS_PER_BITCOIN)),
            publicKey: destinationPublicKey
          },
          null,
          paymentSegment
        ],
        signature.toTxFormat().toString('hex'),
        tokenOwnerPublicKey.toString('hex'),
        version,
        isZeroFee
      )
    } else {
      if (!isZeroFee) {
        const signature = paymentSignatureCallback(tx, i, input.output._script, input.output._satoshisBN)
        const unlockingScript = bsv.Script.fromASM(signature.toTxFormat().toString('hex') + ' ' + paymentPublicKey.toString('hex'))
        input.setScript(unlockingScript)
      }
    }
  })

  return tx.serialize(true)
}

const MIN_SYMBOL_SIZE = 1
const MAX_SYMBOL_SIZE = 128

// the amount of satoshis in a bitcoin
const SATS_PER_BITCOIN = 1e8

// numberToLESM converts a number into a little endian byte slice representation,
// using the minimum number of bytes possible, in sign magnitude format.
function numberToLESM (num) {
  const n = bsv.crypto.BN.fromNumber(num)
  return n.toSM({ endian: 'little' }).toString('hex')
}

// replaceAll is used for node versions < 15, where the STRING.replaceAll function is built in.
function replaceAll (string, search, replace) {
  const pieces = string.split(search)
  return pieces.join(replace)
}

// getTransaction gets a bitcoin transaction from Taalnet.
async function getTransaction (txid) {
  const url = `https://${process.env.API_NETWORK}.whatsonchain.com/v1/bsv/${process.env.API_NETWORK}/tx/hash/${txid}`

  const response = await axios({
    method: 'get',
    url,
    auth: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  })

  return response.data
}

// getRawTransaction gets a bitcoin transaction from Taalnet in raw / hex format.
async function getRawTransaction (txid) {
  const url = `https://${process.env.API_NETWORK}.whatsonchain.com/v1/bsv/${process.env.API_NETWORK}/tx/${txid}/hex`

  const response = await axios({
    method: 'get',
    url,
    auth: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  })

  return response.data
}

// getFundsFromFaucet gets satoshis from the Taalnet faucet.
async function getFundsFromFaucet (address) {
  const url = `https://taalnet.whatsonchain.com/faucet/send/${address}`

  const response = await axios.get(url, {
    auth: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  })

  const txid = response.data

  // Check this is a valid hex string
  if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
    throw new Error(`Failed to get funds: ${txid}`)
  }

  const faucetTx = await getTransaction(txid)

  let vout = 0
  if (faucetTx.vout[0].value !== 0.01) {
    vout = 1
  }

  return [{
    txid,
    vout,
    scriptPubKey: faucetTx.vout[vout].scriptPubKey.hex,
    amount: faucetTx.vout[vout].value
  }]
}

// broadcast will send a transaction to Taalnet.
async function broadcast (tx) {
  if (Buffer.isBuffer(tx)) {
    tx = tx.toString('hex')
  }
  const url = `https://${process.env.API_NETWORK}.whatsonchain.com/v1/bsv/${process.env.API_NETWORK}/tx/raw?dontcheckfee=true`

  const response = await axios({
    method: 'post',
    url,
    auth: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    },
    data: {
      txhex: tx
    }
  })

  let txid = response.data

  if (txid[0] === '"') {
    txid = txid.slice(1)
  }

  if (txid.slice(-1) === '\n') {
    txid = txid.slice(0, -1)
  }

  if (txid.slice(-1) === '"') {
    txid = txid.slice(0, -1)
  }

  // Check this is a valid hex string
  if (!txid.match(/^[0-9a-fA-F]{64}$/)) {
    throw new Error(`Failed to broadcast: ${txid}`)
  }

  return txid
}

// now decode addr to pubKeyHash
function addressToPubkeyhash (addr) {
  const address = bsv.Address.fromString(addr)
  return address.hashBuffer.toString('hex')
}

function reverseEndian (str) {
  const num = new BN(str, 'hex')
  const buf = num.toBuffer()
  return buf.toString('hex').match(/.{2}/g).reverse().join('')
}

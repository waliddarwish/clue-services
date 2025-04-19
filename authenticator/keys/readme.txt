Generating private key: 
openssl genrsa -des3 -out smart_private.pem 2048
phrase: smart

Generating public key: 
openssl rsa -in smart_private.pem -outform PEM -pubout -out smart_public.pem



openssl aes-256-cbc -nosalt -P -in dbKey
passphrase: SubiNation!!
key=B22371642FFD4886821BF2FFAC86B977D56C483371BF1EBF91A6D6A184445472
iv =797910DCA135066FE06F002B86F5D56C






openssl genpkey -algorithm RSA -out clue_private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in clue_private_key.pem -out clue_puplic_key.pem

openssl rsa -in privkey.pem -passin pass:foobar -pubout -out privkey.pub

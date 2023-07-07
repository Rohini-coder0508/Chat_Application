import base64
import json
SECRET_KEY = '1234'
import sys

if(sys.argv[1] == 'encrypt'):
    message = sys.argv[2]
    encode_message = message.encode("ascii")
    base64_bytes = base64.b64encode(encode_message)
    encrypted = base64_bytes.decode("ascii")
    print(json.dumps(encrypted)) 
    sys.stdout.flush(encrypted)

else:
    encryptedMessage = sys.argv[2]
    key = sys.argv[3]
    if(key==SECRET_KEY):
        encode_message = encryptedMessage.encode("ascii")
        base64_bytes = base64.b64decode(encode_message)
        decrypted = base64_bytes.decode("ascii")
        print(decrypted)
        sys.stdout.flush(decrypted)


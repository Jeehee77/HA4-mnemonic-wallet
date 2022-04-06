const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const lightwallet = require('eth-lightwallet');
const port = 3000;

app.use(bodyParser.json());
// 새로운 니모닉 코드 발급
app.post('/newMnemonic', async(req, res) => {
    let mnemonic;
    try {
        mnemonic = lightwallet.keystore.generateRandomSeed();
        res.json({mnemonic});
    } catch(e) {
        console.log(e);
    }
});

app.post('/newWallet', async(req, res) => {
    let password = req.body.password;
    let mnemonic = req.body.mnemonic;
    try {
        // 키스토어 생성
        lightwallet.keystore.createVault(
            {
                password: password,
                seedPhrase: mnemonic,
                hdPathString: "m/0'/0'/0'"
            },
            (err, ks) => {
                // 패스워드를 이용해 키 만들기
                ks.keyFromPassword(password, (err, pwDerivedKey) => {
                    // 새로운 주소 생성 함수 실행
                    ks.generateNewAddress(pwDerivedKey, 1);

                    let address = (ks.getAddresses()).toString();
                    let keystore = ks.serialize();

                    // 생성된 keystore와 address를 응답으로 전송하기
                    // res.set({keystore: keystore, address : address});
                    
                    // 생성된 keystore를 JSON파일로 만들어 로컬 서버에 저장하기
                    fs.writeFile('wallet.json', keystore, (err, data) => {
                        if (err) {
                            res.json({keystore: keystore, address : address, message:"keystore 저장 실패"});
                        } else {
                            res.json({keystore: keystore, address : address, message:"keystore 저장 성공"});
                        }
                    })
                })
            }
        )
    } catch(exception) {
        console.log(exception);
    }
});

app.listen(port, () => {
    console.log('Listening...');
})
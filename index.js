require('dotenv').config()
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const alfabeto = require('./alfabeto');
const sha1 = require('sha1');

let urlGet = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=';
let urlPost = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=';

async function pegarESalvarArquivo() {

    await axios.get(urlGet + process.env.AUTH_TOKEN).then((res) => {
        
        let data = res.data
    
        fs.writeFileSync('./answer.json', JSON.stringify(data));
    })
}

async function decifrarEResumir() {
    
    await fs.readFile('./answer.json', 'utf8' , async (err, data) => {
    
        if (err) throw err;
        let objData = JSON.parse(data)
        
        let numeroCasas = objData.numero_casas;
        let cifrado = objData.cifrado;
    
        let decifrado = '';
    
        for (let i = 0; i < cifrado.length; i++) {
    
            //verifica se a posicao atual é um . ou espaço
            if ((cifrado[i] === '.') || (cifrado[i] === ' ') ){
                decifrado += cifrado[i];
                continue;
            }
    
            //verica se é número
            let temp = parseInt(cifrado[i]);
            if ( Number.isInteger(temp) ) {
                decifrado += cifrado[i];
                continue;
            }
            
            let posicao = alfabeto.indexOf(cifrado[i]) - numeroCasas
            
            if (posicao < 0) {
                posicao = ( alfabeto.length) - (posicao * (-1));
                decifrado += alfabeto[posicao];
            } else {
                decifrado += alfabeto[posicao];
            }
    
        }
    
        //salvando a mensagem decifrada dentro do objeto
        objData.decifrado = decifrado;
        
        //salvando o resumo sha1 dentro do objeto
        let resumo = sha1(decifrado);
        objData.resumo_criptografico = resumo;
    
        fs.writeFileSync('./answer.json', JSON.stringify(objData));
    })
}

async function enviarDesafio() {
    
    const file = fs.createReadStream('./answer.json');

    let formData = new FormData();

    formData.append('answer', file);

    await axios.post(urlPost + process.env.AUTH_TOKEN, formData, {
        headers: formData.getHeaders()
    })
        .then(res => console.log(res))
        .catch(error => console.log(error));
}


async function start() {
    await pegarESalvarArquivo();
    await decifrarEResumir();
    await enviarDesafio();
}

start();
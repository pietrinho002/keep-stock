import axios from 'axios';

//enviar requisições
const api = axios.create({
  baseURL: 'http://10.135.60.111:3000/api', // Substitua pelo seu IP Local
});

export default api;

//para ver o ip local, abra a barra de pesquisa e pesquise por "Powershell"
//Digite "ipconfig" e observe a opção "Endereço IPv4"

//Exemplo, no caso do computador do Murylo, a api é "10.135.60.111" logo depois, coloque ":3000/api"
import axios from 'axios';
const api = axios.create({
    baseURL: 'http://localhost:8000/'
});

const Endpoints = {
    getBoard() {
        return api.get();
    },
    updateBoard(body) {
        return api.put('', body);
    }
}

export default Endpoints;
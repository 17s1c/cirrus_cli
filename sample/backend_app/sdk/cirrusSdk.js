export async function Demo(params) {
    const response = await axios.post("http://localhost:8080/demo", params);
    return response === null || response === void 0 ? void 0 : response.data;
}
export async function Home(params) {
    const response = await axios.post("http://localhost:8080/home", params);
    return response === null || response === void 0 ? void 0 : response.data;
}

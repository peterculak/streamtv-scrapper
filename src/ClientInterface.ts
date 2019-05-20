interface ClientInterface {
    fetch(url: string, options?: any): Promise<any>;
}

export default ClientInterface;

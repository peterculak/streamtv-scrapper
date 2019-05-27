class Slug {
    static fromProgramUrl(url: string): string {
        const bits = url.split('/');
        let slug = bits.pop();
        if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii' || slug === 'o-seriali') {
            slug = bits.pop();
        }

        return String(slug);
    }

    static fromPath(path: string): string {
        path = path.replace(/\/$/, '');
        const bits = path.split('/');

        return bits[bits.length - 1];
    }
}

export default Slug;

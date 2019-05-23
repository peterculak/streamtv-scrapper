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
        const bits = path.split('/');
        const slug = bits[bits.length - 2];

        return slug;
    }
}

export default Slug;

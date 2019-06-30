class Slug {
    static fromProgramUrl(url: string): string {
        if (url.indexOf('bohata-zima-s-jojkou') > -1) {
            return 'bohata-zima-s-tv-joj';
        } else if (url.indexOf('-po-skole') > -1) {
            return 'poskole';
        } else if (url.indexOf('-rozum-v-hrsti') > -1) {
            return 'rozum-v-hrsti';
        } else if (url.indexOf('24000-gladiator') > -1) {
            return 'topfest';
        }

        const bits = url.split('/');
        let slug = bits.pop();
        if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii' || slug === 'o-seriali' || slug === 'uvod') {
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

function fix(str) {
    try {
        let b1 = Buffer.from(str, 'latin1');
        let s1 = b1.toString('utf8');
        let b2 = Buffer.from(s1, 'latin1');
        let s2 = b2.toString('utf8');
        if (s2.includes('Ã')) throw new Error();
        return s2;
    } catch(e) {
        try {
            let b1 = Buffer.from(str, 'latin1');
            let s1 = b1.toString('utf8');
            return s1;
        } catch(e2) {
            return str;
        }
    }
}
console.log('Original L2: ', 'gia_Ãƒâ€žÃ¢â‚¬ËœÃƒâ€žÃ†â€™ng');
console.log('Fixed L2: ', fix('gia_Ãƒâ€žÃ¢â‚¬ËœÃƒâ€žÃ†â€™ng'));
console.log('Original L1: ', 'gia_Ã„â€˜Ã„Æ’ng');
console.log('Fixed L1: ', fix('gia_Ã„â€˜Ã„Æ’ng'));

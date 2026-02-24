
import bcrypt from 'bcryptjs';

const password = 'grampanchayat_admin';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);

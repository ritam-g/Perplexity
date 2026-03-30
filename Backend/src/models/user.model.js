import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    verified: {
        type: Boolean,
        default: false
    },
   
}, {
    timestamps: true
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10);

})
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}
// userSchema.index({ email: 1, username: 1 }, { unique: true })
export default mongoose.model('User', userSchema);


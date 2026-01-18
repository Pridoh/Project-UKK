import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeClosed } from 'lucide-react';
import { Input } from './input';

export type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                ref={ref}
                type={show ? 'text' : 'password'}
                className={className}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
                onClick={() => setShow((prev) => !prev)}
                aria-label={show ? 'Show password' : 'Hide password'}
            >
                {show ? <Eye className="w-5 h-5" /> : <EyeClosed className="w-5 h-5" />}
            </button>
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
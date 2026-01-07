import { Gate } from '@/backend/Services/Gate';

export class AuthServiceProvider {
    /**
     * Boot the authentication services and define gates/policies.
     */
    public static boot() {
        const gate = Gate.getInstance();

        // Define the 'viewTelescope' gate
        // Only allow access in local/development environments
        gate.define('viewTelescope', () => {
            return process.env.NODE_ENV !== 'production';
        });
    }
}

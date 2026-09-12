import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {appRoutes} from './app.routes';
import {providePrimeNG} from "primeng/config";
import Aura from '@primeuix/themes/aura';
import { AUTH_GATEWAY } from 'auth';
import { FirebaseAuthGateway } from './firebase/firebase-auth.gateway';


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
        { provide: AUTH_GATEWAY, useExisting: FirebaseAuthGateway }
    ]
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return next(req);

    const raw = localStorage.getItem('wc_user');
    if (!raw) return next(req);

    try {
        const user = JSON.parse(raw);
        const cloned = req.clone({
            setHeaders: {
                'X-User-Id': String(user.idUsuario ?? ''),
                'X-User-Role': String(user.idRol ?? '')
            }
        });
        return next(cloned);
    } catch {
        return next(req);
    }
};
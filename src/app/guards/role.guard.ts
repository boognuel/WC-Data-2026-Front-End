import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!user) return router.createUrlTree(['/login']);

    const allowedRoles: number[] = route.data['roles'] ?? [];
    if (allowedRoles.length === 0 || allowedRoles.includes(user.idRol)) {
        return true;
    }

    return router.createUrlTree(['/equipos']);
};
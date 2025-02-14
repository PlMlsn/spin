from utils_functions import FB
import numpy as np

class BiSaturation:
    def __init__(self):
        self.eps = 1.
        self.gamma1 = 9.855e-2
        self.gamma2 = 3.65e-3
        self.eps_par = 0.1
        self.umax = 1.
        self.umin = -1.

        self.x0 = np.array([0., 1., 0., 1.])
        self.xfinal = np.zeros((4,))
  
    def set_eps(self, eps):
        self.eps = eps

    def initialize(self):
        n = 501
        time = np.linspace(0., 1., n)
        xp = np.zeros((10, len(time)))
        xp[1] = np.linspace(self.x0[1], self.xfinal[1], n)
        xp[3] = np.linspace(self.x0[3], self.xfinal[3], n)
        xp[4] = np.full_like(time, 44.76952614788222)
        xp[5] = np.linspace(0, -1, n)
        xp[6] = np.linspace(0, -1, n)
        xp[7] = np.linspace(0, -1, n)
        xp[8] = np.linspace(0, -1, n)
        z = np.zeros((3, len(time)))
        z[0] = -1
        return time, xp, z




    def ode(self, time, xp, z):
        n = xp.shape[0] // 2
        x, p = xp[:n], xp[n:]
        u, _, _ = z
        dxdpdt = np.zeros_like(xp)
        dxdpdt[0] = (-self.gamma1*x[0] - x[1]*u) * x[4]
        dxdpdt[1] = (-self.gamma2*(1-x[1]) + x[0]*u) * x[4]
        dxdpdt[2] = (-self.gamma1*x[2] -( 1 - self.eps_par)*x[3]*u) * x[4]
        dxdpdt[3] = (-self.gamma2*(1-x[3]) + ( 1 - self.eps_par)*x[2]*u) * x[4]
        dxdpdt[4] = 0
        dxdpdt[5] = (self.gamma1*p[0] - p[1]*u) * x[4]
        dxdpdt[6] = (u*p[0] + self.gamma2*p[1]) * x[4]
        dxdpdt[7] = (self.gamma1*p[2] - (1 - self.eps_par)*p[3]*u) * x[4]
        dxdpdt[8] = ((1 - self.eps_par)*u*p[2] + self.gamma2*p[3]) * x[4]
        dxdpdt[9] = p[0] * (-self.gamma1*x[0] - x[1]*u) + p[1] * (-self.gamma2*(1-x[1]) + x[0]*u) + p[2] * (-self.gamma1*x[2] -( 1 - self.eps_par)*x[3]*u) + p[3] * (-self.gamma2*(1-x[3]) + ( 1 - self.eps_par)*x[2]*u)
        return dxdpdt
    
    def odejac(self, time, xp, z):
        n = xp.shape[0] // 2
        m = z.shape[0]
        x, p = xp[:n], xp[n:]
        u, _, _= z

        fxp = np.zeros((2 * n, 2 * n, time.size))
        fxp[0, 0] = -self.gamma1 * x[4]
        fxp[0, 1] = -u * x[4]
        fxp[1, 0] = u  * x[4]
        fxp[1, 1] = self.gamma2 * x[4]
        fxp[2, 2] = -self.gamma1 * x[4]
        fxp[2, 3] = -(1 - self.eps_par)*u * x[4]
        fxp[3, 2] = (1 - self.eps_par)*u * x[4]
        fxp[3, 3] = self.gamma2 * x[4]

        fxp[5, 5] = self.gamma1 * x[4]
        fxp[5, 6] = -u * x[4]
        fxp[6, 5] = u * x[4]
        fxp[6, 6] = self.gamma2 * x[4]
        fxp[7, 7] = self.gamma1 * x[4]
        fxp[7,8] = -(1 - self.eps_par)*u * x[4]
        fxp[8,7] = (1 - self.eps_par)*u * x[4]
        fxp[8,8] = self.gamma2 * x[4]
        fxp[9,5] = -self.gamma1*x[0] - x[1]*u
        fxp[9,6] = -self.gamma2*(1-x[1]) + x[0]*u
        fxp[9,7] = -self.gamma1*x[2] -( 1 - self.eps_par)*x[3]*u
        fxp[9,8] = -self.gamma2*(1-x[3]) + ( 1 - self.eps_par)*x[2]*u

        fz = np.zeros((2 * n, m, time.size))
        fz[0,0] = -x[1] * x[4]
        fz[1,0] = x[0] * x[4]
        fz[2,0] = -(1 - self.eps_par)*x[3] * x[4]
        fz[3,0] = (1 - self.eps_par)*x[2] * x[4]
        fz[5,0] = -p[1] * x[4]
        fz[6,0] = p[0] * x[4]
        fz[7,0] = -(1 - self.eps_par)*p[3] * x[4]
        fz[8,0] = (1 - self.eps_par)*p[2] * x[4]
        fz[9,0] = - p[0]*x[1] + p[1]*x[0] - p[2]*(1 - self.eps_par)*x[3] + p[3]*(1 - self.eps_par)*x[2]
        return fxp, fz
    
    def algeq(self, time, xp, z):
        n = xp.shape[0] // 2
        m = z.shape[0]
        x, p = xp[:n], xp[n:]
        u, lup, lum = z

        alg = np.zeros_like(z)
        alg[0] = - p[0]*x[1] + p[1]*x[0] - p[2]*(1 - self.eps_par)*x[3] + p[3]*(1 - self.eps_par)*x[2] + lup - lum
        alg[1] = FB(lup, u - self.umax, self.eps)
        alg[2] = FB(lum, self.umin - u, self.eps)
        return alg
    

    def algjac(self, time, xp, z):
        x0, x1, x2, x3, x4, p0, p1, p2, p3, p4 = xp
        u, lup, lum = z

        gx = np.zeros((z.shape[0], xp.shape[0], len(time)))
        gx[0, 0] = p1
        gx[0, 1] = -p0
        gx[0, 2] = (1 - self.eps_par)*p3
        gx[0, 3] = -(1 - self.eps_par)*p2
        gx[0, 5] = -x1
        gx[0, 6] = x0
        gx[0, 7] = -(1 - self.eps_par)*x3
        gx[0, 8] = (1 - self.eps_par)*x2


        gz = np.zeros((z.shape[0], z.shape[0], len(time)))
        gz[0, 1] = 1
        gz[0, 2] = -1
        gz[1, 0] = FB(lup, u - self.umax, self.eps, dy=1)
        gz[1, 1] = FB(lup, u - self.umax, self.eps, dx=1)
        gz[2, 0] = - FB(lum, self.umin - u, self.eps, dy=1)
        gz[2, 1] = FB(lum, self.umin - u, self.eps, dx=1)
        return gx, gz
    
    def twobc(self, xp0, xpT, z0, zT):
        bc = np.zeros_like(xp0)
        bc[:4] = xp0[:4] - self.x0
        bc[4:8] = xpT[:4] - self.xfinal
        bc[8] = xp0[-1]
        bc[9] = xpT[-1] - 1.
        return bc
    
    def bcjac(self, xp0, xpT, z0, zT):

        gx0 = np.zeros((xp0.size, xp0.size))
        gx0[:4, :4] = np.eye(4)
        gx0[8, -1] = 1.

        gxT = np.zeros((xpT.size, xpT.size))
        gxT[4:8, :4] = np.eye(4)
        gxT[9, -1] = 1.

        gz0 = np.zeros((xp0.size, z0.size))
        gzT = gz0.copy()
        return gx0, gxT, gz0, gzT

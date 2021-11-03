'''
    Functionality to solve and visualize systems of linear equations up to R^3.  10-3-21
'''
import numpy as np
from numpy import linalg as la
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

class Syst: 
    def __init__(self, comat, ov): 
        # comat is the coefficient matrix, ov is the output vector, both given as nested lists or tuples
        comat = np.array(comat)
        ov = np.array(ov)
        if comat.shape[0] != ov.shape[0]: 
            raise TypeError(f'The coefficient matrix has {comat.shape[0]} rows, but the output vector has {ov.shape[0]} rows. The row number needs to be the same.')
        self.comat = comat
        self.ov = ov
        self.dimension = comat.shape[0]
        while 0 in self.comat[:, self.dimension - 1]: 
            # avoid divide by zero errors in the explicit graphed functions
            self.comat[:, self.dimension - 1] = np.random.randint(10, size=(1, self.dimension))
    
    def solve(self): 
        if la.det(self.comat) == 0.0: 
            raise ValueError('The coefficient matrix has determinant 0; there are no solutions.')
        return np.matmul(la.inv(self.comat), self.ov)
        
    def visualize(self): 
        if self.dimension == 2: 
            lower, upper = -10, 10
            count = int(upper - lower)
            x = np.arange(lower, upper)
            y1 = self.get_explicit(0, (count,), x)
            y2 = self.get_explicit(1, (count,), x)
            plt.plot(x, y1)
            plt.plot(x, y2, 'k-')
            plt.grid()
            plt.show()
            
        if self.dimension == 3:
            lower, upper = (-10, 10)
            count = 10
            x = np.linspace(lower, upper, count)
            y = np.linspace(lower, upper, count)
            x, y = np.meshgrid(x, y)
            z1 = self.get_explicit(0, (count, count), x, y)
            z2 = self.get_explicit(1, (count, count), x, y)
            z3 = self.get_explicit(2, (count, count), x, y)            
            ax = plt.figure().add_subplot(111, projection='3d')
            ax.plot_surface(x, y, z1, alpha=0.5)
            ax.plot_surface(x, y, z2, alpha=0.5)
            ax.plot_surface(x, y, z3, alpha=0.5)
            soln = self.solve()
            ax.scatter(soln[0], soln[1], soln[2])
            plt.show()
            
            
    def get_explicit(self, row, shape, x, y=None): 
        if self.dimension == 2: 
            # Since each equation is given implicitly by the row as ax + by = c, the explicit equation is y = c/b - ax/b
            return (-1 * self.comat[row][0] / self.comat[row][1]) * x + np.full(shape=shape, fill_value=self.ov[row]/self.comat[row][1])
        if self.dimension == 3:
            # Since each equation is given implicitly by the row as ax + by + cz = d, the explicit equation is z = d / c - a * x / d - b * y / d
            a = self.comat[row][0]
            b = self.comat[row][1]
            c = self.comat[row][2]
            d = self.ov[row]
            return np.full(shape=shape, fill_value=d/c) + -1 * ((a / c) * x + (b / c) * y)
           
        
    
if __name__ == '__main__': 
    test_size = 2
    test_coefs = np.random.randint(low=-10, high=10, size=(test_size, test_size))
    test_out = np.random.randint(low=-10, high=10, size=(test_size, 1))
    
    test_syst = Syst(test_coefs, test_out)
    print(test_syst.solve())
    test_syst.visualize()
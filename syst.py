'''
    Functionality to solve and visualize systems of linear equations up to R^3.  10-3-21
'''
import numpy as np
from numpy import linalg as la
import matplotlib.pyplot as plt

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
    
    def solve(self): 
        if la.det(self.comat) == 0.0: 
            raise ValueError('The coefficient matrix has determinant 0; there are no solutions.')
        return np.matmul(la.inv(self.comat), self.ov)
        
    def visualize(self): 
        if self.dimension == 2: 
            pass
        
    
if __name__ == '__main__': 
    test_size = 3
    test_coefs = np.random.randint(low=-10, high=10, size=(test_size, test_size))
    test_out = np.random.randint(low=-10, high=10, size=(test_size, 1))
    
    test_syst = Syst(test_coefs, test_out)
    print(test_syst.solve())
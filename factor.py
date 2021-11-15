class Factor: 
    def __init__(self, exprn): 
        self.exprn = exprn
    
    def gcf(self, other):
        gcf = Factor({})
        for i in self.exprn: 
            if i in other.exprn:
                gcf.exprn[i] = min(self.exprn[i], other.exprn[i])
        return gcf
    
    def __repr__(self): 
        return str(self.exprn)
        
if __name__ == '__main__': 
    x = Factor({2:2, 3:1, 5:1, 7:1})
    y = Factor({2:2, 7:1, 13:1})
    print(x.gcf(y))
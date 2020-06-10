import sys
import osmnx as ox
import json

def navigate(fromA, toB):
    A = ox.geocode(fromA)
    B = ox.geocode(toB)
    lis = [A, B]
    a = json.dumps(lis)
    print(a)
    sys.stdout.flush()
    return lis

if __name__ == "__main__":
    navigate(sys.argv[1], sys.argv[2])

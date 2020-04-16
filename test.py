import sys
import osmnx as ox
print('Geocoding...')

def navigate(fromA, toB):
    A = ox.geocode(fromA)
    B = ox.geocode(toB)
    print(A)
    print(B)
    sys.stdout.flush()

if __name__ == "__main__":
    navigate(sys.argv[1], sys.argv[2])

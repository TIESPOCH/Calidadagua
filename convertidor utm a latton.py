import pandas as pd
from pyproj import Proj

# Leer archivo CSV
file_path = 'C:\\Users\\User\\Desktop\\coordenadasfisio.csv'
df = pd.read_csv(file_path)

# Establecer proyección UTM para la zona 18 Sur
p = Proj(proj='utm', zone=18, ellps='WGS84', south=True)

# Convertir coordenadas UTM a latitud y longitud
for i in range(len(df)):
    lon, lat = p(df.loc[i, 'COORD- X'], df.loc[i, 'COORD- Y'], inverse=True)
    df.loc[i, 'COORD- X'] = lat
    df.loc[i, 'COORD- Y'] = lon

# Renombrar columnas a latitud y longitud
df.rename(columns={'COORD- X': 'latitud', 'COORD- Y': 'longitud'}, inplace=True)

# Guardar el DataFrame actualizado en el archivo CSV original
df.to_csv(file_path, index=False)

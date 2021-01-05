import pandas as pd

csv_dir="../../data/main.csv"
country="United States of America"
col=[
    'key',
    'date',
    'country_code',
    'country_name',
    'subregion1_code',
    'subregion1_name',
    'subregion2_code',
    'subregion2_name',
    'new_confirmed',
    'new_deceased',
    'new_recovered',
    'new_tested',
    'total_confirmed',
    'total_deceased',
    'total_recovered',
    'total_tested',
    'population',
    'population_density',
    'gdp',
    'average_temperature',
    'minimum_temperature',
    'maximum_temperature'
]

def main():
    df = pd.read_csv(csv_dir)
    new_df=df[df.country_name==country]
    new_df=new_df[col]
    new_df.to_csv(../../data/country+'.csv')

if __name__ == '__main__':
    main()

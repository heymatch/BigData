#from scipy.integrate import odeint
#from scipy.optimize import curve_fit
#import warnings
#import numpy as np
import os
import math
import optuna
import warnings
import matplotlib
#matplotlib inline
import numpy as np
import pandas as pd
import matplotlib.cm as cm
from datetime import timedelta
from datetime import datetime
import matplotlib.pyplot as plt
from scipy.integrate import odeint
from sklearn.cluster import KMeans
from collections import defaultdict
import matplotlib.colors as mcolors
import matplotlib.dates as mdates
from scipy.optimize import curve_fit
optuna.logging.disable_default_handler()
pd.plotting.register_matplotlib_converters()
from matplotlib.ticker import ScalarFormatter
from dateutil.relativedelta import relativedelta
from sklearn.feature_extraction.text import TfidfVectorizer

from google.cloud import bigquery

def main():
    client = bigquery.Client()
    query = """
        SELECT 
            country_name 
        FROM 
            bigquery-public-data.covid19_open_data.covid19_open_data 
        GROUP BY 
            country_name 
        ORDER BY 
            country_name
    """

    country = []
    query_job = client.query(query)
    for row in query_job:
        country.append(row["country_name"])

    query = """
        SELECT
            population,
            AVG((population - cumulative_confirmed - cumulative_recovered - cumulative_deceased)) as S,
            AVG(cumulative_confirmed) as I,
            AVG(cumulative_recovered) as R
        FROM 
            `bigdata-301014.Domographics.population` 
        INNER JOIN 
            `bigquery-public-data.covid19_open_data.covid19_open_data`
        ON 
            location_key = key
        WHERE 
            LENGTH(location_key) = 2 
            AND country_name = '{country}'
        GROUP BY 
            population
        LIMIT 10
    """.format(country=country[1])

    query_job = client.query(query)

    n = 0
    S0 = 0
    I0 = 0
    R0 = 0
    for row in query_job:
        n = row["population"]
        S0 = row["S"]
        I0 = 1
        R0 = 0

    def sir_model(y, x, beta, gamma):
        sus = -beta * y[0] * y[1] / n
        rec = gamma * y[1]
        inf = -(sus + rec)
        return sus, inf, rec

    def fit_odeint(x, beta, gamma):
        print(" beta: ", beta, " gamma: ", gamma)
        return odeint(sir_model, (S0, I0, R0), x, args=(beta, gamma))[:,1]

    query = """
        SELECT
            date,
            IFNULL(cumulative_confirmed, 0) as I
        FROM 
            bigquery-public-data.covid19_open_data.covid19_open_data 
        WHERE 
            LENGTH(location_key) = 2 
            AND country_name = '{country}' 
    """.format(country=country[1])

    query_job = client.query(query)

    xdata = []
    ydata = []
    i = 1
    for row in query_job:
        ydata.append(float(row["I"]))
        #xdata.append(row["date"])
        xdata.append(i)
        i = i + 1

    xdata = np.array(xdata)
    ydata = np.array(ydata)

    print(xdata)
    print(ydata)
    popt, pcov = curve_fit(fit_odeint, xdata, ydata, maxfev=1000000000)

    print(np.round(np.sqrt(pcov[0][0]),3))
    print(np.round(np.sqrt(pcov[1][1]),3))

if __name__ == '__main__':
    main()
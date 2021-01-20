"""Reproduced from:https://www.kaggle.com/kalyanmohanty/forecasting-with-sir-model"""
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

result_root="Predict_Result/"#file for all the predict results of every countries
confirmed_df  = pd.read_csv('time_series_covid_19_confirmed.csv')
deaths_df     = pd.read_csv('time_series_covid_19_deaths.csv')
recoveries_df = pd.read_csv('time_series_covid_19_recovered.csv')
population_df = pd.read_csv('locations_population.csv')
country_file=''#file name of every single country

result = {}
result["country_name"] = []
result["date"] = []
result["point"] = []

#生成國家人口dictionary,重新命名及處理空值
def preprocess_population_dict():
    global population_df
    df_pop = population_df.copy()
    df_pop = df_pop.rename({ 'Province.State' : 'province', 'Country.Region': 'country'}, axis = 1)
    cols = ['country', 'province', 'Population']
    df_pop = df_pop.loc[:,cols].fillna('-')
    df_pop.loc[df_pop['country'] == df_pop['province'],'province'] = '-'

    total = df_pop.loc[df_pop['province'] != '-', :].groupby('country').sum()
    total.to_csv('total.csv')
    total_pop = total.reset_index().assign(Province="-")
    df_pop = pd.concat([df_pop, total_pop], axis=0, sort=True)

    df_pop = df_pop.drop_duplicates(subset=["country", "province"], keep="first")
    # Global
    global_value = df_pop.loc[df_pop["province"] == "-",'Population'].sum()
    df_pop = df_pop.append(pd.Series(["Global", "-", global_value], index=cols), ignore_index=True)
    # Sorting
    df_pop = df_pop.sort_values("Population", ascending=False).reset_index(drop=True)
    df_pop = df_pop.loc[:, cols]
    population_df = df_pop.copy()
    df = population_df.loc[population_df["province"] == "-", :]
    population_dict = df.set_index("country").to_dict()["Population"]
    return population_dict

#進行sir model計算
def sir_model_fitting(country, cluster_population=500000000, passed_data=0, show_plots=1, date_to_predict="2021-02-03"):#days_to_predict="10"):
    """Fit SIR model and plot data vs model result for 90 days for comparison"""
    
    date_to_predict=datetime.strptime(date_to_predict, "%Y-%m-%d")
    days_to_predict=len(pd.date_range(start="2020-12-07",end=date_to_predict))
    totaldays=pd.date_range(start="2020-01-22",end=date_to_predict)

    if passed_data:
        ydata   = country
        country = 'Worldwide (excluding China)' 
    else:
        confirmed          = np.array(confirmed_df.loc[country, confirmed_df.columns[2:]])
        recovered          = np.array(recoveries_df.loc[country, recoveries_df.columns[2:]])
        deaths             = np.array(deaths_df.loc[country, deaths_df.columns[2:]])
        ydata              = confirmed - recovered - deaths
        print("y",len(ydata))
    print(type(ydata))
    xdata = np.arange(len(ydata))+1
    days_to_predict = len(xdata) + days_to_predict#
    ind   = np.where(ydata>0)[0][0]#找到不為0的第一格
    #print(np.where(ydata>0),np.where(ydata>0)[0],'ind',ind)
    model_output = ydata[ind:]#model output從ydata不為0的那一天開始
    model_input = np.arange(len(model_output))

    inf0 = model_output[0]
    sus0 = cluster_population - inf0
    rec0 = 0

    def sir_model(y, x, beta, gamma):
        sus = -beta * y[0] * y[1]/cluster_population
        rec = gamma * y[1]
        inf = -(sus + rec)
        return sus, inf, rec

    def fit_odeint(x, beta, gamma):
        #print(" beta: ", beta, " gamma: ", gamma)
        return odeint(sir_model, (sus0, inf0, rec0), x, args=(beta, gamma))[:,1]
    
    #擬和函數
    popt, pcov = curve_fit(fit_odeint, model_input, model_output,maxfev=1000000000)##curve_fit(f, xdata, ydata) ydata = f(xdata, *params) + eps
    fitted = fit_odeint(np.arange(days_to_predict-ind), *popt)
    fitted = np.append(np.zeros((ind,1)), fitted)#把最前面還沒有發現案例的幾天的0補上去
    fitted=fitted.clip(0)#把順預測為負數的地方變0
    fitted=np.array([i if i.is_integer() else np.ceil(i)  for i in fitted])#把人數變整數

    global result
    

    if show_plots:
        date_start=datetime.strptime("2020-1-22", "%Y-%m-%d")
        real_data_end=datetime.strptime("2020-12-06", "%Y-%m-%d")
        real_data_days = mdates.drange(date_start,real_data_end+ timedelta(days=1),timedelta(days=1))
        predict_days = mdates.drange(date_start,date_to_predict+ timedelta(days=1),timedelta(days=1))
        fig = plt.figure(figsize = (13,8))
        
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=3))
        plt.gcf().autofmt_xdate()
        plt.plot(real_data_days, ydata, 'o')

        plt.plot(predict_days, fitted)
        plt.plot([real_data_end,real_data_end],[0, np.max(fitted)], ':k')#today we're here
        plt.legend(['data', 'model prediction', "today we're here 12/6"])
        plt.title("SIR model fit to 'active cases' of " + country)
        plt.ylabel("Population infected")
        plt.xlabel("Days since 22 Jan 2020")
        plt.grid('best')
        plt.savefig(result_root+country_file+'/'+country_file+'.png')
        print("Optimal parameters: beta =", round(popt[0],3), " gamma = ", round(popt[1],3))
        #print('Goodness of fit', round(r2_score(ydata, fit_odeint(xdata, *popt)),4)*100, ' %')
        print('Optimal parameters Standard Dev: std_beta =', np.round(np.sqrt(pcov[0][0]),3), ' std_gamma =', np.round(np.sqrt(pcov[1][1]),3))
        #fitted_df = pd.DataFrame([fitted.reshape(-1, len(fitted)), totaldays],columns=["data", "date"])
        #fitted_df.to_csv(result_root+country_file+'/'+country_file+'.csv',index=False)
        for i in range(len(fitted)):
            result["country_name"].append(country)
            result["date"].append(fitted[i])
            result["point"].append(totaldays[i])
            
    else:
        return fitted
    
def main():
    global confirmed_df,deaths_df,recoveries_df,population_df,country_file
    population_dict=preprocess_population_dict()#produce population records of every countries
    confirmed_df= confirmed_df.groupby(['Country/Region']).sum()
    recoveries_df= recoveries_df.groupby(['Country/Region']).sum()
    deaths_df= deaths_df.groupby(['Country/Region']).sum()
    Countries=confirmed_df.index.tolist()
    #產生結果總資料夾
    try:
        os.mkdir(result_root)
    except:
        print("make result_root error")
    
    #跑病歷紀錄裡有的所有國家,預測至2021/12/31,nb,若population dict裡面沒有該國家 則用原先預設的500000000
    for country_name in Countries:
        
        print(country_name)
        if country_name=='Taiwan*':
            country_file='Taiwan'
        else: 
            country_file=country_name
        try:
            os.mkdir(result_root+country_file)
        except:
            print("make "+country_name+" error")

        if country_name in population_dict:
            sir_model_fitting(country_name,population_dict[country_name],date_to_predict="2021-12-31")
        else:
            sir_model_fitting(country_name,date_to_predict="2021-12-31")

if __name__ == '__main__':
    main()
    print(result)
    v = pd.DataFrame(data=result)
    v.to_csv("./result.csv", index=False)
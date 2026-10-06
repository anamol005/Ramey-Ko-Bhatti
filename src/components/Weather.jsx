import {useEffect, useState} from 'react';

const Weather = () => {
  const [temperature, setTemperature] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getWeather = async () => {
      try {
        const apiKey = 'fe2f3baefff2517245a6a72552efcc9c';

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q= Vantaa&units=metric&appid=${apiKey}`
        );
        if (!response.ok) {
          setError('Weather unavailable');
          return;
        }

        const data = await response.json();

        setTemperature(data.main.temp);
      } catch (error) {
        console.log(error);
        setError('Weather unavailable');
      }
    };

    getWeather();
  }, []);

  return (
    <div className="weather-card">
      <div>
        <p className="weather-small-title">CURRENT WEATHER</p>

        <h2>Weather near the restaurant</h2>

        <p className="weather-location"> Vantaa, Finland</p>
      </div>

      <div className="weather-temperature">
        {error
          ? error
          : temperature !== null
            ? `${temperature.toFixed(1)} °C`
            : 'Loading...'}
      </div>
    </div>
  );
};

export default Weather;

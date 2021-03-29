import fastify from "fastify";
import axios from "axios";
import xml2js from "xml2js";

const HOURS = [0, 300, 600, 900, 1200, 1800, 1500, 2100, 2400];
const parser = new xml2js.Parser({ explicitArray: false });

const server = fastify({
  logger: true,
});

function processWeatherData(time, daysData) {
  const t = getTime(Number(time));
  // const ret = daysData.map((day) {

  // })
  return "asd";
}

function getTime(time, hours = HOURS) {
  const absolutes = hours.map((hour) => Math.abs(time - hour));
  const smallestDifferenceIndex = findMinReturnIndex(absolutes);
  return hours[smallestDifferenceIndex];
}

function findMinReturnIndex(list) {
  if (list.length === 1) {
    return 0;
  }
  let smallest = 0;
  for (let i = 1; i < list.length; i++) {
    if (list[i] < list[smallest]) {
      smallest = i;
    }
  }
  return smallest;
}

server.get("/history:params", async (request, reply) => {
  const { day, month, place, time } = request.query;
  const url = `http://api.worldweatheronline.com/premium/v1/past-weather.ashx?key=&q=${place}&date=${day}-${month}`;
  try {
    const responses = await Promise.all([
      axios.get(`${url}-2019`),
      axios.get(`${url}-2018`),
      axios.get(`${url}-2017`),
      axios.get(`${url}-2016`),
      axios.get(`${url}-2015`),
    ]);
    let datas = [];
    responses.forEach(async (response) => {
      if (response.status !== 200) return;
      let data = await parser.parseStringPromise(response.data);
      datas.push(data.data.weather.hourly);
      processWeatherData(time, data.data.weather.hourly);
    });

    return { data: datas };
  } catch (e) {
    return {
      error: e.message,
    };
  }
});

const start = async () => {
  try {
    await server.listen(3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();

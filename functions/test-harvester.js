/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {harvest} = require('./harvester.js');

// Function to convert timestamp to human-readable format
function convertTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toUTCString();
}

// Function to deeply compare two objects and report differences
function compareObjects(obj1, obj2, baseKey = '') {
  const differences = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach((key) => {
    const value1 = obj1[key];
    const value2 = obj2[key];
    const currentKey = baseKey ? `${baseKey}.${key}` : key;

    if (value1 && !value2) {
      differences.push(`${currentKey} is present in the first object but missing in the second`);
    } else if (!value1 && value2) {
      differences.push(`${currentKey} is missing in the first object but present in the second`);
    } else if (value1 && value2 && typeof value1 === 'object' && typeof value2 === 'object') {
      differences.push(...compareObjects(value1, value2, currentKey));
    } else if (value1 !== value2) {
      // Check if values are numbers and compare
      if (!isNaN(value1) && !isNaN(value2)) {
        const num1 = Number(value1);
        const num2 = Number(value2);
        const difference = Math.abs(num1 - num2);
        differences.push(`${currentKey} differs: ${num1 > num2 ? `${num1} > ${num2}` : `${num2} > ${num1}`} : ${difference}`);
      } else {
        differences.push(`${currentKey} differs: ${value1} vs ${value2}`);
      }
    }
  });

  return differences;
}

function harvestPromise(network) {
  return new Promise((resolve, reject) => {
    harvest(network, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function main() {
  const networks = ['astar', 'shibuya', 'shiden', 'rocstar'];

  for (const network of networks) {
    try {
      const result = await harvestPromise(network);
      const response = await fetch(`https://gas.astar.network/api/gasnow?network=${network}&type=gas`);
      const api = await response.json();

      // Convert timestamps to human-readable time
      result.timestamp = convertTimestamp(result.timestamp);
      api.data.timestamp = convertTimestamp(api.data.timestamp);

      // Compare the data and print differences
      const differences = compareObjects(result, api.data);
      if (differences.length) {
        console.log('Differences found in', network, differences);
      }
    } catch (error) {
      console.error('Error during harvesting:', error);
    }
  }
}

// Schedule the harvestAllNetworks function to run every minute
main().catch((error) => console.error('An error occurred:', error));

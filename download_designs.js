const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
  {
    name: 'auth.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MxOGQ3NzAzMWRiMzQ4Nzc4YWMwYWE2YTc4MTEyNjgyEgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'expense.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzliMTNhNmVlZTBlNzRlNWI5NGYwODY4MzI3OTExNzg1EgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'trip_details.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQxNzQ2NWE2NTZjYTRjMTdhY2ViZDFmNDRiY2ViMDQzEgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'create_trip.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA0NGJmZWM5MWVhMDQ5MjE5NjRjZmRhODU5NjNhMWI0EgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'dashboard.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM2NmIxZDJkODczZjRmNTVhMjA4OGNhMDQ3NTY5YjBhEgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'ai_assistant.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2QxMmY3ZTMyNDMxNjRmNzc5YTY5MzRiMDhjOTg1NmJmEgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  },
  {
    name: 'landing.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2QwMzg1ODYwNzQ5ZjQzMDM4OTAzNWMyYTIwNTkxZjViEgsSBxDYsI_nhhEYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTEzNzcxOTkyNDM1OTk3MDM5&filename=&opi=89354086'
  }
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  const dir = path.join(__dirname, 'design_reference');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log(`Downloading screens to: ${dir}`);
  for (const screen of screens) {
    const dest = path.join(dir, screen.name);
    console.log(`Downloading ${screen.name}...`);
    try {
      await download(screen.url, dest);
      console.log(`Saved ${screen.name}`);
    } catch (err) {
      console.error(`Error downloading ${screen.name}: ${err.message}`);
    }
  }
  console.log('All downloads completed.');
}

main();

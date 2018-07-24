const Discord = require('discord.js');
const config = require('./config.json');
const version = require('./package.json').version;

let mode = "On";  
let booster = "Off";
let PRIO_STRING = "";

function sendPrio(message){
  message.channel.send(
    new Discord.RichEmbed()
      .setTitle("PokeSpank Priority:")
      .setColor("#d361ed")
      .setThumbnail(bot.user.avatarURL)
      .setDescription((PRIO_STRING == "")?"NIL":PRIO_STRING)
  );
}

let CONFIG_DATA = process.env.METADATA.split(">.<");
let CONSOLE = CONFIG_DATA[0];
let COMMAND_LOG = CONFIG_DATA[1];
let AGENT_ID = CONFIG_DATA[2].split(",");
let SPAM_CHANNEL = CONFIG_DATA[3].split(",");

function deleteMesage(message){
  if(bot.guilds.get(message.guild.id).members.get(bot.user.id).hasPermission("MANAGE_MESSAGES"))
      message.delete();
}

//random number generator
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//random channel id
function getRandomChannel(){
    return SPAM_CHANNEL[getRandomInt(SPAM_CHANNEL.length)];
}

//random spam message
function getRandomMessage(){
    return config.SPAM_MSG[getRandomInt(config.SPAM_MSG.length)];
}

//spamtime func
function spamtime(bot){
    if(mode == "On")
    {
    let spam_house = bot.channels.get(getRandomChannel());
    spam_house.startTyping(3);
    spam_house.send(getRandomMessage());
    spam_house.stopTyping(true);
    }
}

function sendStatus(channel){
  let my_date = new Date().toString();
  var my_embed = new Discord.RichEmbed()
  .setTitle("Daycare Configuration:")
  .setColor("#22dd22")
  .addField("Mode",mode)
  .addField("Boost",booster)
  .setFooter(my_date.substring(0,my_date.indexOf('+')));
  channel.send(my_embed);
}

//spamboost func
function spamboost(bot){
if(booster == "On")
{
bot.channels.get(COMMAND_LOG).send("p!buy 3");
}
}

//next pokemon
function nextPokemon(bot)
{
    if(mode == "On"){
bot.channels.get(CONSOLE).send("p!info").then(() => {
    const filter = m => config.POKECORD_ID == m.author.id;

    bot.channels.get(CONSOLE).awaitMessages(filter, { time: 10000, maxMatches: 1, errors: ['time'] })
        .then(messages => {
            messages.array().forEach(msg => {
            if(msg.embeds.length == 0)
                nextPokemon(bot);
            else 
                msg.embeds.forEach((embed) => {
                if(embed.title && embed.title.startsWith("Level 100")){
                  setTimeout(function(){bot.channels.get(CONSOLE).send("p!n")},3000);
                }
                else
                nextPokemon(bot);
                })
            });
        })
        .catch(() => {
            nextPokemon(bot);
        });
    });
  }
}

//logging function
function logEnter(logdata, bool)
{
  let logauth = logdata.author || bot.users.get(config.POKECORD_ID);
    if(bool)
    bot.channels.get(CATCH_LOG).send(logdata);
    else
    {
    logEntry(COMMAND_LOG,logauth.username,logauth.avatarURL,logdata.content==null?logdata:logdata.content);
    }
}

function logEntry(channel_id,auth_un,auth_url,content){
  if(!bot.channels.get(channel_id).guild.members.get(bot.user.id).hasPermission("MANAGE_WEBHOOKS"))
  return;
  bot.channels.get(channel_id).createWebhook(auth_un,auth_url)
    .then(
      webhook => utilizeHook(webhook,auth_un,auth_url,content)
      )
      .catch(
        er => console.log(er)
      );
  }

async function utilizeHook(webhook,auth_un,auth_url,content){
    await webhook.edit(auth_un,auth_url)
      .then(
        webhook.send(content)
      )
      .catch(
        err => console.log(err)
      );
    webhook.delete();
  }

const bot = new Discord.Client();
bot.on("ready", function() {
    console.log('Logged in as '+bot.user.username);
    sendStatus(bot.channels.get(CONSOLE));
    bot.user.setStatus('invisible')
    .catch(console.log);

    //spam
    setInterval(spamtime,1500,bot);
    setInterval(spamboost,600100,bot);

});

//error listener
bot.on("error", function(err) {
    console.log(err);
});

//When a message is received
bot.on("message", function(message) {

    if(message.author.id != config.POKECORD_ID && AGENT_ID.indexOf(message.author.id) == -1) return;
    if(message.channel.type == "dm") return ;
    
    //ping
    if(message.content.toLowerCase() == process.env.PREFIX+"ping")
    {
      let pingtime = parseInt(bot.ping);
      message.channel.send(`Po${'o'.repeat((pingtime-100)/10)}ng! ${pingtime}ms`);
    }
    
    //version
    else if(message.content.toLowerCase().startsWith(process.env.PREFIX+"version"))
    {
      message.channel.send(version);
    }
    
    else if(message.content.toLowerCase() == process.env.PREFIX+"stop")
    {
      if(mode == "On")
      {
      mode = "Off";
      booster = "Off";
      sendStatus(message.channel);
      }
      else
      {
        message.channel.send("I am not doing anything...");
      }
    }

    else if(message.content.toLowerCase() == process.env.PREFIX+"config")
    {
      sendStatus(message.channel);
    }
    
    /*else if(message.content.toLowerCase() == process.env.PREFIX+"start")
    {
      if(mode == "On")
      {
        message.reply("Daycare is already open :thinking:");
      }
      else
      {
        mode = "On";
        sendStatus(message.channel);
      }
    }*/
    
    else if( mode == "On"){
    
      if(message.content.toLowerCase() == process.env.PREFIX+"boost on")
      {
        if(booster == "On")
        {
          message.channel.send("Booster is already enabled!");
        }
        else
        {
          message.channel.send("Booster Enabled!");
          message.channel.send("p!buy 3");
          booster = "On";
        }
      }
      
      else if(message.content.toLowerCase() == process.env.PREFIX+"boost off")
      {
        if(booster == "Off")
        {
          message.channel.send("Booster is already Disabled");
        }
        else
        {
          message.channel.send("Booster Disabled!");
          booster = "Off";
        }
      }
    
    //When a New pokemon appears or a pokemon levels up
    else if(message.author.id == config.POKECORD_ID)
    {   
      //level up
      //if(message.embeds[0] && message.embeds[0].title && message.embeds[0].title.indexOf(bot.user.username)!=-1 && message.embeds[0].description && message.embeds[0].description.indexOf("evolving!")!=-1)
      if(message.embeds[0] && message.embeds[0].title && message.embeds[0].title.indexOf(bot.user.username)!= -1 && message.embeds[0].description && message.embeds[0].description.indexOf(" is now level 100!")!=-1)
      {
        if(PRIO_STRING == ""){
          nextPokemon(bot);
        }
        else
          {
            let prio_array = PRIO_STRING.split(" ");
            bot.channels.get(CONSOLE).send("p!select "+prio_array[0]);
            PRIO_STRING = prio_array.slice(1).join(" ");
          }
        try
        {
        logEnter(
          new Discord.RichEmbed()
          .setTitle(message.embeds[0].title)
          .setDescription(message.embeds[0].description)
          .setColor(message.embeds[0].color)
          , false);
        }
        catch(w){
          console.log(w);
        }
      }
}

else if(message.content.toLowerCase().startsWith(process.env.PREFIX+"setprio")){
  if(message.content.length < 9+process.env.PREFIX.length)
    PRIO_STRING = "";
  else {
    PRIO_STRING = message.content.substring(8+process.env.PREFIX.length);
  }
  sendPrio(message);
}

else if(message.content.toLowerCase() == process.env.PREFIX+"getprio"){
  sendPrio(message);
}
    
else if(message.content.startsWith(process.env.PREFIX))
    {
      message.channel.send("p!"+message.content.substring(process.env.PREFIX.length));
      logEnter(message, false);
      deleteMesage(message);
    }

  }
});    

bot.login(process.env.BOT_TOKEN);
const SSH = require('simple-ssh');
const { greenBright, redBright } = require('chalk')
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { token, prefix } = require('./config.json')


const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.on(`ready`, () => {
    console.log(greenBright('R e a d y'))
})

const userArgs = new Array();

client.on(`message`, (msg)  => {
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const channelId = msg.channel.id; 

    if(commandName === 'userinput'){
        if(msg.author.bot) {return}
        msg.channel.send(`Write your credentials[host][user][password] . . .`)
        const filter = m => m.author.id === msg.author.id;
        const collector = msg.channel.createMessageCollector(filter, {max: 3});
        collector.on('collect', message => {
            userArgs.push(message.content);
            message.delete({time : 10});
        })

        collector.on(`end`, () => {
            client.channels.cache.get(channelId).send('--Finished--')
            console.log(`User args = ${userArgs}`);
        })
    }
    if(commandName === 'showinput'){
        if(userArgs.length < 1){
            msg.channel.send('No user input. Use .userinput first')
        } else {
            console.log(userArgs);
            msg.channel.send(userArgs);
        }
    }

    if(commandName === 'ssh2'){
        const host = userArgs[0];
        const user = userArgs[1];
        const password = userArgs[2];
        console.log(host, user, password)
        console.log(greenBright('Inside the system'))

        ssh = new SSH({
            host: host,
            user: user,
            pass: password
        });
        ssh.exec('cat /home/usuario/ssh/config', {
            in: fs.readFileSync('./ssh/config')
         }).start();
    }

    if(commandName == 'ssh'){
        const host = userArgs[0];
        const user = userArgs[1];
        const password = userArgs[2];
       /* if((host || user || password) == undefined){msg.channel.send('User input : undefined'); return}*/
        console.log(host, user, password)
        console.log(greenBright('Inside the system'))
        commandInput(msg, host, user, password)
        msg.channel.send('Write the command(exit to finish): ')
    }
});

function commandInput(msg, host, user, password){
    ssh = new SSH({
        host: host,
        user: user,
        pass: password
    });
    const filter = m => m.author.id === msg.author.id;
    const collector = msg.channel.createMessageCollector(filter, {max: 1})
    var command;
    collector.on('collect', message => {
        command = message.content;
    })
    collector.on('end', function(){
        if(command === undefined || command === 'exit'){
            msg.channel.send('Message is null, write again .ssh or you manually exited >');
            return;
        } else {
            ssh.exec(command, {
                out: function(stdout) {
                    msg.channel.send(`>$${stdout}`);
                }
            }).start();
            commandInput(msg, host, user, password);
        }
    })

}

client.login(token)



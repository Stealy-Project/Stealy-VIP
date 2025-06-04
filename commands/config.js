const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { vanity_defender } = require('../structures/Ticket')
const { Selfbot } = require('../structures/Client');
const fs = require('node:fs');

module.exports = {
    name: "config",
    description: "Configure votre Stealy VIP.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) {
        if (!fs.existsSync(`./db/${message.author.id}.json`)) return;
        const db = require(`./db/${message.author.id}.json`);

        const embed = {
            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
            color: 0xFFFFFF,
            fields: [
                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
            ]
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('token')
                .setLabel('Edit Token')
                .setStyle(ButtonStyle.Secondary),
            
            new ButtonBuilder()
                .setCustomId('password')
                .setLabel('Edit Password')
                .setStyle(ButtonStyle.Secondary),
        )

        const msg = await message.channel.send({ embeds: [embed], components: [row] });
        const collector = msg.createMessageComponentCollector({ time: 1000 * 60 * 10 });

        collector.on('end', () => { msg.edit({ components: [] }); message.delete() });
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: 'Vous ne pouvez pas utiliser ce bouton', flags: 64 });

            switch(i.customId){
                case 'token':
                    const tokenModal = new ModalBuilder()
                    .setCustomId('token')
                    .setTitle('Veuillez entrer le token')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('token')
                                .setLabel("Veuillez entrer votre token ici?")
                                .setStyle(TextInputStyle.Short)
                        )
                    )

                    i.showModal(tokenModal);
                    const tokenCollector = await i.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => null);
                    if (!tokenCollector || tokenCollector.size == 0) return;

                    const token = tokenCollector.fields.getTextInputValue('token').replaceAll('"', '');
                    await tokenCollector.deferReply({ flags: 64 });

                    const res = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: token } });
                    if (!res.ok) return tokenCollector.editReply({ content: 'Le token est invalide' });


                    try { client.selfbots.find(c => c.token == db.token)?.destroy().catch(() => null); } catch {}
                    clearInterval(client.selfbots.find(c => c.token == db.token)?.interval);
                    
                    client.selfbots = client.selfbots.filter(c => c.token !== db.token);

                    db.token = token;
                    fs.writeFileSync(`./db/${message.author.id}.json`, JSON.stringify(db, null, 4));

                    tokenCollector.editReply({ content: `Votre token a été modifié` });
                        
                    new Selfbot({ token: db.token, client });

                    msg.edit({ embeds: 
                        [{
                            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
                            color: 0xFFFFFF,
                            fields: [
                                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
                            ]
                        }] 
                    })
                    break;

                case 'password':
                    const passwordModal = new ModalBuilder()
                    .setCustomId('password')
                    .setTitle('Veuillez entrer votre mot de passe')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('password')
                                .setLabel("Veuillez entrer votre token/clé A2F ici?")
                                .setStyle(TextInputStyle.Short)
                        )
                    )

                    i.showModal(passwordModal);
                    const passwordCollector = await i.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => null);
                    if (!passwordCollector || passwordCollector.size == 0) return;

                    db.password = passwordCollector.fields.getTextInputValue('password')
                    fs.writeFileSync(`./db/${message.author.id}.json`, JSON.stringify(db, null, 4));

                    if (client.selfbots.find(c => c.token == db.token)) vanity_defender(client.selfbots.find(c => c.token == db.token))
                    passwordCollector.reply({ content: 'Votre mot de passé/clé A2F a été modifié', flags: 64 });
                    msg.edit({ embeds: 
                        [{
                            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
                            color: 0xFFFFFF,
                            fields: [
                                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
                            ]
                        }] 
                    })
                    break;
            }
        })
    },
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        if (!fs.existsSync(`./db/${interaction.user.id}.json`)) return interaction.reply({ content: "Vous n'avez pas d'abonnement en cours." });
        const db = require(`../db/${interaction.user.id}.json`);

        const embed = {
            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
            color: 0xFFFFFF,
            fields: [
                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
            ]
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('token')
                .setLabel('Edit Token')
                .setStyle(ButtonStyle.Secondary),
            
            new ButtonBuilder()
                .setCustomId('password')
                .setLabel('Edit Password')
                .setStyle(ButtonStyle.Secondary),
        )

        await interaction.reply({ embeds: [embed], components: [row], withResponse: true });
        const collector = interaction.channel.createMessageComponentCollector({ time: 1000 * 60 * 10 });

        collector.on('end', () => interaction.editReply({ components: [] }));
        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: 'Vous ne pouvez pas utiliser ce bouton', flags: 64 });

            switch(i.customId){
                case 'token':
                    const tokenModal = new ModalBuilder()
                    .setCustomId('token')
                    .setTitle('Veuillez entrer le token')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('token')
                                .setLabel("Veuillez entrer votre token ici?")
                                .setStyle(TextInputStyle.Short)
                        )
                    )

                    i.showModal(tokenModal);
                    const tokenCollector = await i.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => null);
                    if (!tokenCollector || tokenCollector.size == 0) return;

                    const token = tokenCollector.fields.getTextInputValue('token').replaceAll('"', '');
                    await tokenCollector.deferReply({ flags: 64 });

                    const res = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: token } });
                    if (!res.ok) return tokenCollector.editReply({ content: 'Le token est invalide' });

                    try { client.selfbots.find(c => c.token == db.token)?.destroy().catch(() => null); } catch {}
                    clearInterval(client.selfbots.find(c => c.token == db.token)?.interval);

                    client.selfbots = client.selfbots.filter(c => c.token !== db.token);

                    db.token = token;
                    fs.writeFileSync(`./db/${interaction.user.id}.json`, JSON.stringify(db, null, 4));

                    tokenCollector.editReply({ content: `Votre token a été modifié` });
                    interaction.editReply({ embeds: [{
                            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
                            color: 0xFFFFFF,
                            fields: [
                                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
                            ]
                        }] 
                    })

                    new Selfbot({ token: db.token, client });
                    break;

                case 'password':
                    const passwordModal = new ModalBuilder()
                    .setCustomId('password')
                    .setTitle('Veuillez entrer votre mot de passe')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('password')
                                .setLabel("Veuillez entrer votre token/clé A2F ici?")
                                .setStyle(TextInputStyle.Short)
                        )
                    )

                    i.showModal(passwordModal);
                    const passwordCollector = await i.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => null);
                    if (!passwordCollector || passwordCollector.size == 0) return;

                    db.password = passwordCollector.fields.getTextInputValue('password')
                    fs.writeFileSync(`./db/${interaction.user.id}.json`, JSON.stringify(db, null, 4));
                    if (client.selfbots.find(c => c.token == db.token)) vanity_defender(client.selfbots.find(c => c.token == db.token))

                    passwordCollector.reply({ content: 'Votre mot de passé/clé A2F a été modifié', flags: 64 });
                    interaction.editReply({ embeds: [{
                            author: { name: 'Stealy VIP', icon_url: 'https://stealy.cc/stealy' },
                            color: 0xFFFFFF,
                            fields: [
                                { name: 'Expiration', value: `${db.expire >= Date.now() ? `<t:${Math.round(db.expire / 1000)}:R>` : db.expire == 0 ? '♾' : '❌'}`, inline: true },
                                { name: 'Token', value: !db.token ? '❌' : `${db.token ? db.token.split('.')[0] + '.XXXXXX.XXXXXXXXXXXXXXXXXXXXXX' : '❌'}`, inline: true },
                                { name: 'Password', value: db.password ? '✅' : '❌', inline: true }
                            ]
                        }] 
                    })
                    break;
            }
        })
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setContexts([0, 1, 2])
            .setDescription(this.description)
    }
}
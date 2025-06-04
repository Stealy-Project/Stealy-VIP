const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction } = require("discord.js");
const example = require('../db/example.json');
const fs = require('node:fs');

module.exports = {
    name: "credit",
    description: "Gère les crédits d'un utilisateur.",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args
    */
    async execute(client, message, args) {},
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch(subcommand){
            case 'create':
                const user = interaction.options.getUser('user');
                const time = interaction.options.getString('temps') || interaction.options.getString('temps-custom');

                if (!user) return interaction.reply({ content: 'Veuillez entrer un utilisateur valide', flags: 64 });
                if (!time || isNaN(client.ms(time))) return interaction.reply({ content: 'Veuillez entrer un temps valide', flags: 64 });
                if (fs.existsSync(`./db/${user.id}.json`)) return interaction.reply({ content: `${user} a déjà une base de donnée`, flags: 64 });

                example.expire = Date.now() + client.ms(time);
                fs.writeFileSync(`./db/${user.id}.json`, JSON.stringify(example, null, 4));

                interaction.reply({ content: `${client.config.emojis.yes} L'abonnement de ${user} a bien été crée.\n${client.config.emojis.clock} Il expire <t:${Math.round((Date.now() + client.ms(time)) / 1000)}:R>` })
                user.createDM(true).then(dmChannel => dmChannel.send(`**${client.config.emojis.yes} Votre abonnement a été crée !\n${client.config.emojis.clock} Il expire <t:${Math.round((Date.now() + client.ms(time)) / 1000)}:R>**`))
                break;

            case 'edit':
                const userEdit = interaction.options.getUser('user');
                const timeEdit = interaction.options.getString('temps');
                const action = interaction.options.getString('effet');
                
                if (!userEdit) return interaction.reply({ content: 'Veuillez entrer un utilisateur valide', flags: 64 });
                if (!timeEdit || isNaN(client.ms(timeEdit))) return interaction.reply({ content: 'Veuillez entrer un temps valide', flags: 64 });
                if (!fs.existsSync(`./db/${userEdit.id}.json`)) return interaction.reply({ content: `${userEdit} n'a pas d'abonnement en cours`, flags: 64 });

                const db = require(`../db/${userEdit.id}.json`);
                db.expire = action == 'add' ? db.expire + client.ms(timeEdit) : db.expire - client.md(timeEdit);

                fs.writeFileSync(`./db/${userEdit.id}.json`, JSON.stringify(db, null, 4));

                interaction.reply({ content: `${client.config.emojis.yes} L'abonnement de ${userEdit} a bien été modifié.\n${client.config.emojis.clock} Il expire <t:${Math.round(db.expire / 1000)}:R>` })
                userEdit.createDM(true).then(dmChannel => dmChannel.send(`**${client.config.emojis.warn} Votre abonnement a été modifié !\n${client.config.emojis.clock} Il expire maintenant <t:${Math.round(db.expire / 1000)}:R>**`))
                break;

            case 'delete':
                const userDelete = interaction.options.getUser('user');
                const raison = interaction.options.getString('raison');

                if (!userDelete) return interaction.reply({ content: 'Veuillez entrer un utilisateur valide', flags: 64 });
                if (!fs.existsSync(`./db/${userDelete.id}.json`)) return interaction.reply({ content: `${userDelete} n'a pas d'abonnement en cours`, flags: 64 });

                fs.unlinkSync(`./db/${userDelete.id}.json`);
                interaction.reply({ content: `${client.config.emojis.yes} L'abonnement de ${userDelete} a bien été supprimé${raison ? ` avec comme motif \`${raison}\`` : ''}.` })
                userDelete.createDM(true).then(dmChannel => dmChannel.send(`**${client.config.emojis.warn} Votre abonnement a été supprimé ${raison ? `avec comme motif \`${raison}\` ` : ''}!**`))
                break;
        }
        
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(o =>
                o.setName('create')
                .setDescription("Crée l'abonnement d'un utilisateur")
                .addUserOption(o =>
                    o.setName('user')
                    .setDescription("L'utilisateur à qui crée l'abonnement")
                    .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('temps')
                    .setDescription("La durée de l'abonnement")
                    .setChoices([
                        //{ name: '3 Jours (essai)', value: '3d' },
                        { name: '7 Jours', value: '7d' },
                        { name: '15 Jours', value: '15d' },
                        { name: '21 Jours', value: '21d' },
                        { name: '1 Mois', value: '31d' },
                        { name: '2 Mois', value: '62d' },
                        { name: '3 Mois', value: '93d' }
                    ])
                    .setRequired(false)
                )
                .addStringOption(o => 
                    o.setName("temps-custom")
                    .setDescription("Le temps customisé de l'abonnement")
                    .setRequired(false)
                )
            )

            .addSubcommand(o =>
                o.setName('edit')
                .setDescription("Modifie le temps de l'abonnement")
                .addUserOption(o =>
                    o.setName('user')
                    .setDescription("L'utilisateur à qui ajouter du temps")
                    .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('effet')
                    .setDescription('Ajouter/Retirer du temps')
                    .addChoices([
                        { name: 'Ajout', value: 'add' },
                        { name: 'Retrait', value: 'remove' }
                    ])
                    .setRequired(true)
                )
                .addStringOption(o => 
                    o.setName("temps")
                    .setDescription("Le temps customisé de l'abonnement à ajouter/retirer")
                    .setRequired(true)
                )
            )

            .addSubcommand(o =>
                o.setName('delete')
                .setDescription("Supprime un abonnement")
                .addUserOption(o =>
                    o.setName('user')
                    .setDescription("L'utilisateur à qui supprimer l'abonnement")
                    .setRequired(true)
                )
                .addStringOption(o =>
                    o.setName('raison')
                    .setDescription("La raison de la suppression de l'abonnement")
                    .setRequired(false)
                )
            )
    }
}
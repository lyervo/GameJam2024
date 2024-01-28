import recipe from './recipe.js';
class MainLevel extends Phaser.Scene {
    selectAudio;
    errorAudio;
    shakeAudio;

    uiDepth = 4;
    playerDepth = -1;
    barTableDepth = -2;
    npcDepth = -3;

    player;
    destinationX = 0;
    interactables = [];
    targetInteractable = null;
    questGetAppleState = 0;
    dialogueWindow = null;
    dialogueText = null;
    isInDialogue = false;
    minInteractionDistance = 100;
    dispenserWindowUI = [];
    dispenserButtonList = [];
    dispenserIngredients = [];
    drinkIngredients = [];
    ingredientNames = {
        'b_bitters':'sitters',
        'b_antimatter':'Antimatter-sugar',
        'b_coconut':'Coconut Milk',
        'b_ginger':'Ginger Ale',
        'b_hyperfuel':'Hyperfuel',
        'b_ice':'Ice',
        'b_lemon':'Lemon-Lime Juice',
        'b_mint':'Mint Extract',
        'b_orange':'Orange Juice',
        'b_pineapple':'Pineapple Juice',
        'b_salt':'Salt',
        'b_snake':'Snake Juice',
        'b_spice':'Spice Melagne',
        'b_stone':'Whiskey Stone',
        'b_sugar':'Sugar',
        'b_bz':'All Purpose Bz',
        'b_vodka':'Vodka',
        'b_whiskey':'Whiskey',
        'b_gin':'Gin',
        'b_rum':'Rum'
    }
    customer = [];
    ingredientAmountStatDisplay;
    ingredientContentStatDisplay = [];
    ingredientWarningStatDisplay;
    recipeWindow = undefined;

    customerSeat = [
        {
            x:720,
            taken: false
        },
        {
            x:580,
            taken: false
        },
        {
            x:440,
            taken: false
        }
    ]

    preload() {
        this.load.audio('error', 'audio/error.wav');
        this.load.audio('select', 'audio/select.wav');
        this.load.audio('shake','audio/shake.wav');

        this.load.image('background','img/background.png');
        this.load.image('recipe','img/recipe.png');
        this.load.image('dispenser','img/dispenser.png');
        this.load.image('table','img/table.png');
        this.load.image('player', 'img/basic.png');
        this.load.image('dwarf', 'img/dwarf.png');
        this.load.image('dialogueWindow','img/dialogueWindow.png');
        this.load.image('b_bitters','img/buttons/b_bitters.png');
        this.load.image('b_antimatter','img/buttons/b_antimatter.png');
        this.load.image('b_coconut','img/buttons/b_coconut.png');
        this.load.image('b_ginger','img/buttons/b_ginger.png');
        this.load.image('b_hyperfuel','img/buttons/b_hyperfuel.png');
        this.load.image('b_ice','img/buttons/b_ice.png');
        this.load.image('b_lemon','img/buttons/b_lemon.png');
        this.load.image('b_mint','img/buttons/b_mint.png');
        this.load.image('b_orange','img/buttons/b_orange.png');
        this.load.image('b_pineapple','img/buttons/b_pineapple.png');
        this.load.image('b_salt','img/buttons/b_salt.png');
        this.load.image('b_snake','img/buttons/b_snake.png');
        this.load.image('b_spice','img/buttons/b_spice.png');
        this.load.image('b_stone','img/buttons/b_stone.png');
        this.load.image('b_sugar','img/buttons/b_sugar.png');
        this.load.image('b_bz','img/buttons/b_bz.png');
        this.load.image('b_vodka','img/buttons/b_vodka.png');
        this.load.image('b_whiskey','img/buttons/b_whiskey.png');
        this.load.image('b_gin','img/buttons/b_gin.png');
        this.load.image('b_rum','img/buttons/b_rum.png');
        this.load.image('dispenserArt','img/dispenserArt.png');
        this.load.image('cancelDispenserWindow','img/buttons/b_cancel.png');
        this.load.image('clear','img/buttons/b_clear_all.png');
        this.load.image('serve','img/buttons/b_serve.png');
        this.load.image('dispenserWindowBackground','img/dispenserWindowBackground.png');
        this.load.image('recipeWindow','img/recipeWindow.png');
        this.load.image('returnButton','img/buttons/return.png');
        this.load.image('recipeHighlight','img/recipeHighlighted.png');
        this.load.image('dispenserHighlight','img/dispenserHighlighted.png');

        this.dispenserIngredients = [
            'b_bitters',
            'b_antimatter',
            'b_coconut',
            'b_ginger',
            'b_hyperfuel',
            'b_ice',
            'b_lemon',
            'b_mint',
            'b_orange',
            'b_pineapple',
            'b_salt',
            'b_snake',
            'b_spice',
            'b_stone',
            'b_sugar',
            'b_bz',
            'b_vodka',
            'b_whiskey',
            'b_gin',
            'b_rum'
        ];
        
        this.dispenserIngredients.forEach(function(button) {
            this.load.image(button, 'img/buttons/' + button + '.png');
        }, this);
    }
    
    create() {
        this.selectAudio = this.sound.add('select');
        this.errorAudio = this.sound.add('error');
        this.shakeAudio = this.sound.add('shake');

        let bg = this.add.image(540,338.5,'background');
        bg.setDepth(-5);

        let table = this.add.image(575,450,'table');
        table.setDepth(this.barTableDepth);
        this.createInteractables('recipe',107,208, () => {
            this.createRecipeWindow();
        },1,false,this.barTableDepth, 'recipeHighlight')
        this.createInteractables('dispenser',25,218, () => {
            this.createDispenserWindow();
        }, 1,false, this.barTableDepth,'dispenserHighlight')
        this.player = this.physics.add.sprite(0, 378, 'player');
        this.player.setDepth(this.playerDepth);
        
        this.input.on('pointerdown', function (pointer) {
            if (this.isInDialogue)
            {
                return;
            }
            // this.targetInteractable = null;
            this.destinationX = pointer.x;
            pointer.event.stopPropagation();
        }, this);
        this.createRandomCustomer('Dwarf1','Dwarf',1280);
        this.createRandomCustomer('Dwarf2','Dwarf',1580);
        this.createRandomCustomer('Dwarf3','Dwarf',1780);

    }

    createRecipeWindow()
    {
        this.isInDialogue = true;
        let recipeWindow = this.add.image(540,338.5,'recipeWindow');
        let returnButton = this.physics.add.sprite(900,600,'returnButton');
        returnButton.setInteractive();
        returnButton.on('pointerdown',(pointer) => {
            this.selectAudio.play();
            this.dispenserWindowUI.forEach((e) => {
                e.destroy();
            })
            pointer.event.stopPropagation();
            this.isInDialogue = false;
        });
        this.dispenserWindowUI.push(recipeWindow);
        this.dispenserWindowUI.push(returnButton);

    }


    destroyByName(name) {
        this.interactables.forEach((e) => {
            if (e.objName === name) {
                e.destroy();
            }
        })
    }

    addIngredient(ingredient)
    {
        if (this.ingredientWarningStatDisplay !== undefined)
        {
            this.ingredientWarningStatDisplay.destroy();
        }
        if (this.drinkIngredients.length >= 8)
        {
            this.ingredientWarningStatDisplay = this.add.text(50,10,'Your glass is already full!',{ fontSize: '32px', fill: '#f00' });
            this.dispenserWindowUI.push(this.ingredientWarningStatDisplay);
            this.errorAudio.play();
            return;
        }
        else if (this.drinkIngredients.includes(ingredient))
        {
            this.ingredientWarningStatDisplay = this.add.text(50,10,'You already have this ingredient in your glass!',{ fontSize: '32px', fill: '#f00' });
            this.dispenserWindowUI.push(this.ingredientWarningStatDisplay);
            this.errorAudio.play();
            return;
        }        
        this.selectAudio.play();
        this.drinkIngredients.push(ingredient);
        this.drawIngredientStat();

    }

    drawIngredientStat()
    {
        if (this.ingredientAmountStatDisplay !== undefined)
            this.ingredientAmountStatDisplay.destroy();
        this.ingredientAmountStatDisplay = this.add.text(60,320,`${this.drinkIngredients.length}/8 Ingredients`,{ fontSize: '32px', fill: '#000' });
        this.dispenserWindowUI.push(this.ingredientAmountStatDisplay);
        if (this.ingredientContentStatDisplay.length > 0)
        {
            for(let i = 0; i < this.ingredientContentStatDisplay.length; i++)
            {
                this.ingredientContentStatDisplay[i].destroy();
            }
        }
        for(let i = 0; i < this.drinkIngredients.length; i++)
        {
            this.ingredientContentStatDisplay.push(this.add.text(60,320+((i+1)*30),this.drinkIngredients[i],{ fontSize: '32px', fill: '#000' }));
            this.dispenserWindowUI.push(this.ingredientContentStatDisplay[i]);
        }

    }

    clearIngredient()
    {
        if (this.ingredientWarningStatDisplay !== undefined)
        {
            this.ingredientWarningStatDisplay.destroy();
        }
        this.drinkIngredients = [];
        this.drawIngredientStat();
    }

    getRandomRecipe()
    {
        const randomIndex = Math.floor(Math.random() * recipe.length);
        return recipe[randomIndex];
    }

    createRandomCustomer(customerName,customerSpecies,startX = 1100)
    {
        let newCustomer = { state: 0, drink:'', satifaction: 0, seat: -1 };
        let firstRandomRecipe = this.getRandomRecipe();
        let secondRandomRecipe = this.getRandomRecipe();
        newCustomer.customer = this.createInteractables('dwarf',startX,387,() => {
            // state 0 = walk into scene and take seat 
            // state 1 = not ordered yet
            // state 2 = ordered drink
            // state 3 = received first drink
            // state 4 = ordered second drink
            // state 5 = received second drink

            if (newCustomer.state === 1)
            {
                
                newCustomer.drink = firstRandomRecipe.name;
                this.createDialogueWindow(customerName,'Hi there, can I have a '+firstRandomRecipe.name);
                newCustomer.state++;
                return;
            }
            else if (newCustomer.state === 2)
            {
                if (this.drinkIngredients.length === 0)
                {
                    this.createDialogueWindow(customerName,'Do you have my drink yet? I ordered a '+firstRandomRecipe.name);
                    return;
                    
                }
                if (this.evaluateDrink(newCustomer.drink))
                {
                    newCustomer.drink = secondRandomRecipe.name;
                    this.createDialogueWindow(customerName,'Hmm tasty... can I have a '+secondRandomRecipe.name+' next?');
                    newCustomer.state++;
                    this.drinkIngredients = [];
                    return;
                }
                else
                {
                    this.createDialogueWindow(customerName,'Excuse me, but I did not ordered this?');
                    this.drinkIngredients = [];
                    newCustomer.state = 4;
                    return;
                }
                
            }
            else if (newCustomer.state === 3)
            {
                if (this.drinkIngredients.length === 0)
                {
                    this.createDialogueWindow(customerName,'Do you have my drink yet? I ordered a '+secondRandomRecipe.name);
                }
                else
                {
                    if (this.evaluateDrink(newCustomer.drink))
                    {
                        newCustomer.drink = secondRandomRecipe.name;
                        this.createDialogueWindow(customerName,'This is a nice drink, thank you!');
                        newCustomer.state++;
                        this.drinkIngredients = [];
                        newCustomer.state = 4;
                        return;
                    }
                    else
                    {
                        this.createDialogueWindow(customerName,'Excuse me, but I did not ordered this?');
                        this.drinkIngredients = [];
                        newCustomer.state = 4;
                        return;
                    }
                }
            }
            
        },1,true,this.npcDepth);


        this.customer.push(newCustomer);
        console.log(this.customer.length);
    }

    evaluateDrink(drink)
    {
        let drinkPassRate = 0.75;
        let targetDrink = this.getRecipeByName(drink).recipe;
        let totalIngredient = targetDrink.length;
        let matchedIngredient = 0;
        this.drinkIngredients.forEach((e) => {
            if (targetDrink.includes(e))
            {
                matchedIngredient++;
            }
        });
        return (matchedIngredient/targetDrink.length) >= drinkPassRate;


    }

    getRecipeByName(name)
    {
        for (let i = 0; i < recipe.length; i++)
        {
            if (recipe[i].name === name)
            {
                return recipe[i];
            }
        }
        return false;
    }

    createDispenserWindow()
    {
        this.dispenserWindowUI.push(this.add.image(540,338.5,'dispenserWindowBackground'));
        this.isInDialogue = true;
        let originX = 150;
        let originY = 25;
        let spacingX = 190;
        let spacingY = 60;
        let column = 5;
        let count = 0;
        let row = 0;
        for (let i = 0;i < this.dispenserIngredients.length; i++)
        {
            let newButton = this.physics.add.sprite(originX+((count)*(spacingX)),originY+((row+1)*spacingY),this.dispenserIngredients[i]);
            newButton.setInteractive();
            newButton.on('pointerdown', (pointer) => {
                this.addIngredient(this.ingredientNames[this.dispenserIngredients[i]]);
                pointer.event.stop
            });
            count++;



            if (count >= column)
            {
                count = 0;
                row++;
            }
            this.dispenserWindowUI.push(newButton);
            
        }
        this.dispenserWindowUI.push(this.add.image(500,500,'dispenserArt'));
        let serveButton = this.physics.add.sprite(910,480,'serve');
        serveButton.setInteractive();
        serveButton.on('pointerdown',(pointer) => {
            if (this.drinkIngredients.length === 0)
            {
                this.ingredientWarningStatDisplay = this.add.text(50,10,'You cannot serve an empty glass!',{ fontSize: '32px', fill: '#f00' });
                this.dispenserWindowUI.push(this.ingredientWarningStatDisplay);
                this.errorAudio.play();
                return;
            }
            this.shakeAudio.play();
            if (this.ingredientAmountStatDisplay !== undefined)
                this.ingredientAmountStatDisplay.destroy();
            for (let i = 0; i < this.ingredientContentStatDisplay.length; i++)
            {
                this.ingredientContentStatDisplay[i].destroy();
            }
            this.dispenserWindowUI.forEach((e) => {
                e.destroy();
            })
            pointer.event.stopPropagation();
            this.isInDialogue = false;
            this.selectAudio.play();
        })
        this.dispenserWindowUI.push(serveButton);
        let clearButton = this.physics.add.sprite(910,540,'clear');
        clearButton.setInteractive();
        clearButton.on('pointerdown', (pointer) => {
            this.clearIngredient();
            pointer.event.stopPropagation();
            this.selectAudio.play();
        })
        this.dispenserWindowUI.push(clearButton);
        let cancelButton = this.physics.add.sprite(910,600,'cancelDispenserWindow');
        cancelButton.setInteractive();
        cancelButton.on('pointerdown', (pointer) => {
            this.dispenserWindowUI.forEach((e) => {
                e.destroy();
            })
            if (this.ingredientAmountStatDisplay !== undefined)
                this.ingredientAmountStatDisplay.destroy();
            for (let i = 0; i < this.ingredientContentStatDisplay.length; i++)
            {
                this.ingredientContentStatDisplay[i].destroy();
            }
            pointer.event.stopPropagation();
            this.isInDialogue = false;
            this.selectAudio.play();
        });
        this.dispenserWindowUI.push(cancelButton);
        this.drawIngredientStat();
    }

    createDispenserButton(x,y,image,onClick)
    {
        let newButton = this.physics.add.sprite(x,y,image);
    }

    closeDialogue()
    {
        this.dialogueWindow.destroy();
        this.dialogueText.destroy();
        this.isInDialogue = false;
    }

    createDialogueWindow(name,text,potrait = null)
    {
        this.isInDialogue = true;
        this.dialogueWindow = this.physics.add.sprite(300,550,'dialogueWindow');
        this.dialogueWindow.setInteractive();
        this.interactables.push(this.dialogueWindow);
        this.dialogueWindow.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.closeDialogue();
        })
        this.dialogueText = this.add.text(10, 470, text, { fontSize: '32px', fill: '#fff' });
    }

    createInteractables(imageName, x, y, onClick = null, scale = 1, flip = false, depth = 1,highlight = null) {
        let newObject = this.physics.add.sprite(x, y, imageName);
        newObject.setFlipX(flip);
        newObject.setScale(scale);
        newObject.objName = imageName;
        newObject.setDepth(depth);
        if (onClick !== null) {
            
            newObject.setInteractive();
            newObject.on('pointerdown', (pointer) => {
                pointer.event.stopPropagation();
                if (this.isInDialogue)
                {
                    return;
                }
                this.destinationX = newObject.x;
                this.targetInteractable = newObject;
                
            });

            newObject.onClickResult = onClick;
        }
        this.interactables.push(newObject);
        if (highlight !== null)
        {
            newObject.on('pointerover',() => {
                newObject.setTexture(highlight)
            })

            newObject.on('pointerout', () => {
                newObject.setTexture(imageName)
            })
        }

        return newObject;
    }

    update() {
        if (this.player !== undefined) {
            
            if (this.targetInteractable !== null && Math.abs(this.player.x - this.targetInteractable.x) <= this.minInteractionDistance) {
                this.player.setVelocityX(0);
                if (this.targetInteractable !== null && this.targetInteractable.onClickResult !== null) {
                    this.targetInteractable.onClickResult();
                    this.targetInteractable = null;
                    this.destinationX = this.player.x;
                }    
                

            }
            else if (Math.abs(this.player.x - this.destinationX) <= 3)
            {
                this.player.setVelocityX(0);
            } else if (this.player.x > this.destinationX) {
                this.player.setVelocityX(-400);
                this.player.setFlipX(true);
            }
            else if (this.player.x < this.destinationX) {
                this.player.setVelocityX(400);
                this.player.setFlipX(false);
            }
        }

        if (this.customer.length !== 0)
        {
            this.customer.forEach((e) => {
                if (e.seat === -1)
                {
                    for (let i = 0; i < this.customerSeat.length; i++)
                    {
                        if (!this.customerSeat[i].taken)
                        {
                            console.log('seat '+i);
                            this.customerSeat[i].taken = true;
                            e.seat = i;
                            e.customer.setVelocityX(-200);
                            break;
                        }
                    }
                }
                else if (e.state == 0 && Math.abs(e.customer.x - this.customerSeat[e.seat].x) <= 3)
                {
                    e.customer.x = this.customerSeat[e.seat].x;
                    e.customer.setVelocityX(0);
                    e.state = 1;
                }
                else if (e.state == 4)
                {
                    setTimeout(() => {
                        e.customer.setFlipX(false);
                        e.customer.setVelocityX(200);
                        e.state = 5;
                        if (this.isInDialogue)
                        {
                            this.closeDialogue();
                        }
                    }, 3000);
                    
                }
                else if (e.state == 5 && e.customer.x >= 1280)
                {
                    e.customer.destroy();
                    console.log('destroyed customer');
                    e.customer = null;
                    this.customer = this.customer.filter((e) => e.customer !== null);
                }
            })
        }




    }

    

}


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    scene: MainLevel,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    width: 1080,
    height: 677,
};


const game = new Phaser.Game(config);

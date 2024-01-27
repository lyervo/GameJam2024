import recipe from './recipe.js';
class MainLevel extends Phaser.Scene {
    selectAudio;
    errorAudio;
    shakeAudio;

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

    preload() {
        this.load.audio('error', 'audio/error.wav');
        this.load.audio('select', 'audio/select.wav');
        this.load.audio('shake','audio/shake.wav');
        

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
        this.createRandomCustomer('Dwarf','Dwarf');
        this.createInteractables('dispenser',100,430, () => {
            console.log('dispenser is clicked');  
            this.createDispenserWindow();
        })
        this.add.image(350,550,'table');
        this.player = this.physics.add.sprite(0, 500, 'player');
        
        this.input.on('pointerdown', function (pointer) {
            if (this.isInDialogue)
            {
                return;
            }
            // this.targetInteractable = null;
            this.destinationX = pointer.x;
            pointer.event.stopPropagation();
        }, this);
        
        this.createDispenserWindow();

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
        console.log('select audio playing')
        this.selectAudio.play();
        this.drinkIngredients.push(ingredient);
        this.drawIngredientStat();

    }

    drawIngredientStat()
    {
        if (this.ingredientAmountStatDisplay !== undefined)
            this.ingredientAmountStatDisplay.destroy();
        this.ingredientAmountStatDisplay = this.add.text(40,320,`${this.drinkIngredients.length}/8 Ingredients`,{ fontSize: '32px', fill: '#000' });
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
            this.ingredientContentStatDisplay.push(this.add.text(40,320+((i+1)*30),this.drinkIngredients[i],{ fontSize: '32px', fill: '#000' }));
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

    createRandomCustomer(customerName,customerSpecies)
    {
        let newCustomer = { state: 0, drink:'', satifaction: 0 };
        let firstRandomRecipe = this.getRandomRecipe();
        let secondRandomRecipe = this.getRandomRecipe();
        newCustomer.customer = this.createInteractables('dwarf',1000,500,() => {
            // state 0 = not ordered yet
            // state 1 = ordered drink
            // state 2 = received first drink
            // state 3 = ordered second drink
            // state 4 = received second drink

            if (newCustomer.state === 0)
            {
                
                newCustomer.drink = firstRandomRecipe.name;
                this.createDialogueWindow(customerName,'Hi there, can I have a '+firstRandomRecipe.name);
                newCustomer.state++;
                return;
            }
            else if (newCustomer.state === 1)
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
                    // leave table
                    return;
                }
                
            }
            else if (newCustomer.state === 2)
            {
                if (this.drinkIngredients.length === 0)
                {
                    this.createDialogueWindow(customerName,'Do you have my drink yet? I ordered a '+secondRandomRecipe);
                }
                else
                {
                    if (this.evaluateDrink(newCustomer.drink))
                    {
                        newCustomer.drink = secondRandomRecipe.name;
                        this.createDialogueWindow(customerName,'This is a nice drink, thank you!');
                        newCustomer.state++;
                        this.drinkIngredients = [];
                        return;
                    }
                    else
                    {
                        this.createDialogueWindow(customerName,'Excuse me, but I did not ordered this?');
                        this.drinkIngredients = [];
                        // leave table
                        return;
                    }
                }
            }
            
        },1,true);

        console.log(JSON.stringify(newCustomer));
        this.customer.push(newCustomer);


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
        console.log('matched', matchedIngredient);
        console.log((matchedIngredient/targetDrink.length));
        console.log((matchedIngredient/targetDrink.length) > drinkPassRate);
        return (matchedIngredient/targetDrink.length) >= drinkPassRate;


    }

    getRecipeByName(name)
    {
        for (let i = 0; i < recipe.length; i++)
        {
            if (recipe[i].name === name)
            {
                console.log(recipe[i])
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
        let serveButton = this.physics.add.sprite(910,400,'serve');
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
        })
        this.dispenserWindowUI.push(serveButton);
        let clearButton = this.physics.add.sprite(910,500,'clear');
        clearButton.setInteractive();
        clearButton.on('pointerdown', (pointer) => {
            this.clearIngredient();
            pointer.event.stopPropagation();
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
        });
        this.dispenserWindowUI.push(cancelButton);
        this.drawIngredientStat();
    }

    createDispenserButton(x,y,image,onClick)
    {
        let newButton = this.physics.add.sprite(x,y,image);
    }

    createDialogueWindow(name,text,potrait = null)
    {
        this.isInDialogue = true;
        this.dialogueWindow = this.physics.add.sprite(300,550,'dialogueWindow');
        this.dialogueWindow.setInteractive();
        this.interactables.push(this.dialogueWindow);
        this.dialogueWindow.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.dialogueWindow.destroy();
            this.dialogueText.destroy();
            this.isInDialogue = false;
        })
        this.dialogueText = this.add.text(10, 470, text, { fontSize: '32px', fill: '#fff' });
    }

    createInteractables(imageName, x, y, onClick = null, scale = 1, flip = false) {
        let newObject = this.physics.add.sprite(x, y, imageName);
        newObject.setFlipX(flip);
        newObject.setScale(scale);
        newObject.objName = imageName;
        if (onClick !== null) {
            
            console.log('interactive set')
            newObject.setInteractive();
            newObject.on('pointerdown', (pointer) => {
                pointer.event.stopPropagation();
                if (this.isInDialogue)
                {
                    return;
                }
                console.log('interactive clicked');
                this.destinationX = newObject.x;
                console.log(' i set the deistination x');
                console.log(this.destinationX);
                this.targetInteractable = newObject;
                
            });

            newObject.onClickResult = onClick;
        }
        this.interactables.push(newObject);
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


console.log(recipe);
const game = new Phaser.Game(config);

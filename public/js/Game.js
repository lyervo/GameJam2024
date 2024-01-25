import recipe from './recipe.js';
class MainLevel extends Phaser.Scene {

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

    preload() {
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
            this.destinationX = pointer.x;
        }, this);
        this.createCustomer('Mojito')

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
        if (this.drinkIngredients.length >= 8)
        {
            return;
        }
        this.drinkIngredients.push(ingredient);
    }

    clearIngredient()
    {
        this.drinkIngredients = [];
    }

    createCustomer(drink)
    {
        this.createInteractables('dwarf',1000,500,() => {
            if (this.drinkIngredients.length == 0)
            {
                this.createDialogueWindow('dwarf','Mojito please');
                console.log(recipe);
            }
            else
            {
                if (this.evaluateDrink(drink))
                {
                    this.createDialogueWindow('dwarf','hmmm, tasty');
                }
                else
                {
                    this.createDialogueWindow('dwarf', 'Excuse me? This is not what I ordered?')
                }
                this.clearIngredient();
            }
            
        },1,true);
    }

    evaluateDrink(drink)
    {
        console.log('looking for ',drink);
        let drinkPassRate = 0.75;
        let targetDrink = this.getRecipeByName(drink).recipe;
        let totalIngredient = targetDrink.length;
        console.log('total ',totalIngredient)
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
        return (matchedIngredient/targetDrink.length) > drinkPassRate;


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
            console.log('looping');
            let newButton = this.physics.add.sprite(originX+((count)*(spacingX)),originY+((row+1)*spacingY),this.dispenserIngredients[i]);
            newButton.setInteractive();
            newButton.on('pointerdown', (pointer) => {
                console.log('clicked '+this.dispenserIngredients[i]);
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
            pointer.event.stopPropagation();
            this.isInDialogue = false;
        });
        this.dispenserWindowUI.push(cancelButton);
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
                if (this.isInDialogue)
                {
                    return;
                }
                console.log('interactive clicked');
                this.destinationX = newObject.x;
                this.targetInteractable = newObject;
                pointer.event.stopPropagation();
            });

            newObject.onClickResult = onClick;
        }
        this.interactables.push(newObject);
    }

    update() {
        if (this.player !== undefined) {
            
            if (this.targetInteractable !== null && Math.abs(this.player.x - this.destinationX) <= this.minInteractionDistance) {
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

import {Item} from './item';
import {Partial} from './partial';
import {DeserializeAs} from '@kaiu/serializer';
import {Craft} from './craft';

export class ItemData {

    @DeserializeAs(Item)
    item: Item;

    @DeserializeAs([Item])
    ingredients: Item[];

    @DeserializeAs([Partial])
    partials: Partial[];

    public getIngredient(id: number): Item {
        return this.ingredients.find(item => item.id === id);
    }

    public getCraft(recipeId: string): Craft {
        return this.item.craft.find(i => i.id === recipeId);
    }
}

// Global app controller
//import str from './models/Search';
//import {add as a,multiple as m ,ID as i} from './views/searchView';
//import * as searchView from './views/searchView';

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';

/**
 * Global state of the app
 * -Search object
 * -Current recipe
 * -Shopping list object
 * -liked recipes
 */
const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async() => {
    //1. Get query from view
    const query = 'pizza'; //TODO

    if (query) {
        // 2. New search pbject and add to state
        state.search = new Search(query);
        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            // 4. Search for recipes
            await state.search.getResults();
            // 5, Render
            clearLoader()
            searchView.renderResults(state.search.results);
        } catch (error) {
            alert("Something wrong");
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
})





/**
 * RECIPEE CONTROLLER
 */
const controlRecipe = async() => {
    //Get ID for url
    const id = window.location.hash.replace('#', '');
    if (id) {
        //Prepare UI for change
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected item
        if (state.search) {
            searchView.highlightSelected(id);
        }

        //Create new recipe object
        state.recipe = new Recipe(id);
        try {
            //Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseingredients();
            //Calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Reender recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
        }
    }
}


/**
 * LIST CONTROLLER
 */

const controlList = ()=>{
    //Create a new List if there in none yet
    if(!state.list){
        state.list = new List();
    }
    //Add new ingredient to the list
    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    })
}

//Handle delete and update list item events
elements.shopping.addEventListener('click',e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;
    //handle delete
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem;
        //Delete from UI
        listView.deleteItem(id);
    } else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }
});

//window.addEventListener('hashchange',controlRecipe);
//window.addEventListener('load',controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
//testing

const controlLike = () =>{
    if(!state.likes){
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;
    if(!state.likes.isLiked(currentID)){
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //Toggle the like button
        likeView.toggleLikeBtn(true);
        //Add like to UI List
        likeView.renderLike(newLike);
    }
    else{
        //Remove like to the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likeView.toggleLikeBtn(false);
        //Remove like to UI List
        likeView.deleteLike(currentID);
        
    }
    likeView.toggleLikeMenu(state.likes.getNumLikes());
}

//Restore likes
window.addEventListener('load',()=>{
    state.likes = new Likes();
    state.likes.readStorage()
    likeView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likeView.renderLike(like));
})

elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredient(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredient(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
})





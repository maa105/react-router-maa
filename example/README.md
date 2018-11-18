# React router maa example

This is a sample react app. To run it you need to first `npm install` then `npm start`.

Note the url scheme is as follows:
* `/home` - the home page
* `/products` - the products home page
    * `/products/{:productName}-{:productId}` - the product home page
        * `/products/{:productName}-{:productId}/details` - the product details page
        * `/products/{:productName}-{:productId}/images` - the product images page
    * `/about` - the about page

## hooking the router

The router is connected to the redux store in the `index.js` file you'll notice I dispatch 2 actions:
1- `initRouter` to initialise the router (check url is valid and redirect accordingly if the url is malformed) check "initialisation handling" below.
2- `changeRouterState` which changes the router state in the store through `router.reducer.js`

## displaying according to router state

This is simple all I have to do is get the router state from the store and do conditional rendering. Check `app.component.js` where I just do `{ this.props.page === 'home' ? <Home/> : null }` to display the home page depending on the router state (here `this.props.page` is mapped from the router state in `mapStateToProps`)

## initialisation handling:

In the demo there are 2 products a laptop with id 12345 and a screen with id 11111. Their urls are respectively `http://localhost:3000/products/Laptop-12345` and `http://localhost:3000/products/Screen-11111` try modifing the url from the browser address bar like try `http://localhost:3000/products/Laptop-99999` and notice you will be redirected back to `/products/` also try `http://localhost:3000/products/Laptop-12345/something-else` and notice you get redirected to `http://localhost:3000/products/Laptop-12345` also try `http://localhost:3000/products/OTHER-12345` and notice the name will be corrected and you'll be redirected to `http://localhost:3000/products/Laptop-12345` all this is happening because I hooked an initializationHandler when I initialised the router in `index.js` then I am handeling the initialization asyncronously in the `router.actions.js` thunk initRouter. Where i am loading the products from the server then checking the validity of the product (does it exist and is the name correct) and I am redirecting accordingly.

## route blocking:

I also setup route blocking on the laptop images page `http://localhost:3000/products/Laptop-12345/images` if you try to navigate away from this page you will get a confirmation modal. This is setup in `product-images.component.js`, notice in the function `setupAllowRouteChangeHandler` I push a transitionAllowedCheckFunction (by utilising `pushTransitionAllowedCheckFunction`) then I have this function return a promise where I save the promise's resolve function in `allowRouteChange` for later, and in the dismiss modal function i utilise `allowRouteChange` to either allow or cancel navigation depending on the user's choice. (also not in the transitionAllowedCheckFunction's promise function I explicitly allow navigation for id '11111' thats why you get the modal only when navigating away from the Laptop's images page. I did that to indicate that you can have a check before showing the modal like in real world senarios you would check if incase of a form the user have changed something before showing him the modal)

## route change API

You will notice that I initiate the change of the route by utilising:
* `pushRouterState` function in `top-nav.component.js` which pushes a new state
* `pushRouterStateThroughChange` function in `products.component.js` which takes the old state and applies a change to it (Object.assign) to generate a new state which it then pushes. This in my opinion is neet as it allows you to for example change the product while remaining in the same selected section (details or images) by just changing the productId as I am doing here :)
* `pushRouterStateThroughChange` function in `product.component.js` to select a section (details or images)
* `pushRouterStateThroughChange` function in `product-breadcrumbs.component.js` to deselect the section. (i.e. remove `/details` or `/images`)

See API of react-router-maa for more details

## state to url and back

Check `parseUrl` and `toUrl` functions in `utils/index.js` easy peasy. This is a part that can be abstracted by some other library (e.g. declerative route definition and the library maybe generates for you the `parseUrl` and `toUrl` functions. But for me writing these functions is simple and it gives me more control)


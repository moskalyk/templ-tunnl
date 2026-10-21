              `'::.
          _________H ,%%&%,
         /\     _   \%&&%%&%
        /  \___/^\___\%&%%&&
        |  | []   [] |%\Y&%'
        |  |   .-.   | ||  
      ~@._|@@_|||_@@|~||~
            """) )"""`

# templ-tunnl

create a bridge to connect a localhost running server via a hosted server using a websocket

### 1. start bridge

`$ npm run start:bridge # then send a curl after step 3` 

### 2. start (any) localhost server

`$ PORT=3001 npm run start:source`

### 3. fire up a cli running program to register

`$ node tunnl ACTION=register PORT=3001`

## todos: simple
- [x] simple bridge
- [x] cli interface
- [ ] tests
- [x] multiple running bridges concurrently
- [ ] auth

## todos: i might be too lazy
- [ ] metrics
- [ ] serve usb files
- [ ] https
- [ ] hosted & subdomain

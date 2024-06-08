window.addEventListener('scroll',() =>{

    var navbar = document.querySelector('.navbar')

    window.scrollY > 50 ?  navbar.classList.add('scroll') : navbar.classList.remove('scroll')

}) 

window.onload = 

window.addEventListener('load', () => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: false })
})

function Add(placeholder , val) {
    if (val === 'name') {
        inputHtml = `<input class="input-val" type="text" placeholder="Search By ${placeholder} . . ."></input>`
    }
    if (val === 'year') {
        inputHtml = `<input class="input-val" type="number" placeholder="Search By ${placeholder} . . ."></input>`
    }
    return `<div class="parent show col-12 col-md-6 col-lg-6 mx-auto my-5" data-aos="fade-up">
                <div class="card shadow p-3">
                    <div class="wrap-input-18">
                        <div class="search">
                            <div>
                                ${inputHtml}
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-danger w-50 mx-auto my-3" onclick="invert()">GO</button>
                </div>
            </div>`
}

function showFilmsSearch(obj) {
    let parent = document.querySelector('#btns-search')
    let search = document.querySelector('.search')
    let value = obj.value
    
    if (parent.classList.contains('show')) {
        parent.classList.remove('show')
        parent.classList.add('hide')
    }
    
    if (value === 'name') {
        search.innerHTML += Add('Film Name' , 'name')
    }
    if (value === 'year') {
        search.innerHTML += Add('Release Year' , 'year')
    }
}
function invert() {
    fetch('/assets/netflix_titles.csv')
   .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.text()
    })
   .then(data => {
        const lines = data.split('\n')
        const headers = lines[0].split(',')

        const body = lines.slice(1).map(line => line.split(',').map(value => value.trim()))

        const result = body.map(values => {
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index]
                return obj
            }, {})
        })
        Show(result)
    })
   .catch(error => {
        console.error('Error fetching data:', error)
    })
}

function Show(result) {
    let filmCards = document.querySelector('.film-cards')
    let suggestFilms = document.querySelector('.suggest-films')
    let inputVal = document.querySelector('.input-val').value.trim()
    let type = ''

    if (inputVal!== '') {
        result.forEach(element => {
            if(element.title === inputVal) {
                type = element.type
                filmCards.innerHTML = `
                    <div class="col-12 col-md-6 col-lg-4" data-aos="fade-up">
                        <div class="card">
                            <i class="fa-brands fa-youtube text-danger mx-auto my-3"></i>
                            <div class="card-body d-flex flex-column justify-content-evenly">
                                <h5 class="card-title text-center text-danger">${element.title}</h5>
                                <p class="card-text fw-bold">The Type of Movie you Searched for is <Strong class="text-danger">${element.type}</Strong>. Would you like more Suggestions for Movies in this Type? ${element.type}</p>
                                <button id="myButton" type="button" class="btn btn-warning fw-bold text-capitalize">Our Suggestions</button>
                            </div>
                        </div>
                    </div>`
                    K_NN('myButton', type, result, suggestFilms , 10)
            }
        })
    }
}

function K_NN(buttonId, type, result, suggestFilms, num) {
    const button = document.querySelector(`#${buttonId}`)

    button.addEventListener('click', function () {
        const calculateDistance = (item1, item2) => {
            const item1Lower = item1.toLowerCase()
            const item2Lower = item2.toLowerCase()
            const distance = Math.abs(item1Lower.charCodeAt(0) - item2Lower.charCodeAt(0))
            return distance === 0? 0 : distance
        }

        result.forEach((element, index) => {
            if (index >= num) return
            const distance = calculateDistance(element.type, type)
            if (distance === 0) {
                suggestFilms.innerHTML += `
                    <div class="col-12 col-md-6 col-lg-4 my-3" data-aos="fade-up">
                        <div class="card">
                            <i class="fa-brands fa-youtube text-danger mx-auto my-3"></i>
                            <div class="card-body d-flex flex-column justify-content-evenly">
                                <h5 class="card-title text-center text-danger">${element.title}</h5>
                                <p class="card-text text-center fw-bold">Type : ${element.type}</p>
                                <p class="card-text text-center fw-bold">Distance = ${distance}</p>
                                <p class="card-text text-center fw-bold">Rank = ${index}</p>
                            </div>
                        </div>
                    </div>`
            }
        })
    })
}


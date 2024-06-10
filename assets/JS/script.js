window.addEventListener('scroll',() =>{

    var navbar = document.querySelector('.navbar')

    window.scrollY > 50 ?  navbar.classList.add('scroll') : navbar.classList.remove('scroll')

}) 

window.addEventListener('load', () => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: false })
})

function Add(placeholder) {
    return `<div class="parent show col-12 col-md-6 col-lg-6 mx-auto my-5" data-aos="fade-up">
                <div class="card shadow p-3">
                    <div class="wrap-input-18">
                        <div class="search">
                            <div>
                                <input class="input-val" type="text" placeholder="Search By ${placeholder} . . ."></input>
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
        search.innerHTML += Add('Film Name')
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
    let id
    let type = ''

    if (inputVal!== '') {
        result.forEach(element => {
            if(element.title === inputVal) {
                id = element.show_id
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
                    K_NN('myButton', type, id , result, suggestFilms , 4)
            }
        })
    }
}


function K_NN(buttonId, type, id, result, suggestFilms, num) {
    const button = document.querySelector(`#${buttonId}`)

    button.addEventListener('click', function () {
        const calculateDistance = (word1, word2) => {
            let w1 = parseInt(word1.substring(1))
            let w2 = parseInt(word2.substring(1))
            let distance = Math.abs(w1 - w2) 
            return distance
        }

        const filteredResult = result.filter(element => element.type === type)

        const distances = filteredResult.map((element) => ({
            element,
            distance: calculateDistance(element.show_id, id),
        }))
        distances.sort((a, b) => a.distance - b.distance)
        const topResults = distances.slice(0, num).map(({ element }) => element)

        topResults.forEach((element, index) => {
            // if (index >= num) return
            suggestFilms.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4 my-3" data-aos="fade-up">
                    <div class="card">
                        <i class="fa-brands fa-youtube text-danger mx-auto my-3"></i>
                        <div class="card-body d-flex flex-column justify-content-evenly">
                            <h5 class="card-title text-center text-danger">${element.title}</h5>
                            <p class="card-text text-center fw-bold">Type : ${element.type}</p>
                            <p class="card-text text-center fw-bold">Rank = ${index + 1}</p>
                        </div>
                    </div>
                </div>`
        })
    })
}
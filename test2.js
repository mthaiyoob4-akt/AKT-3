async function checkTypes() {
    const res = await fetch('http://localhost:4000/api/companies');
    const d = await res.json();
    d.data.forEach(c => {
        console.log(c.companyName, '->', typeof c.productsServices, Array.isArray(c.productsServices) ? 'Array' : null);
    });
}
checkTypes();

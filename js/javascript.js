  /* =================== PIPE FROM shop.html (leave as-is) =================== */
  // shop.html must write items with: data-id, data-name, data-price, data-image
  // addToCart(btn) should push objects { id, name, unitPrice, qty, image } to localStorage

  const CART_KEY = 'museumCartV1'; // MUST match shop.html

  function readCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function writeCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  /* ================= END PIPE ============================================= */


  /* ====================== UTILITIES & CONSTANTS =========================== */
  // Currency with parentheses for negatives
  function money(n){
    const sign = n < 0 ? -1 : 1;
    const s = '$' + Math.abs(n).toFixed(2);
    return sign < 0 ? '('+s+')' : s;
  }

  // Spec constants
  const TAX_RATE = 0.102;
  const MEMBER_DISCOUNT_RATE = 0.15;
  const SHIPPING_RATE = 25.00;
  const VOLUME_TIERS = [
    [0.00, 49.99, 0.00],
    [50.00, 99.99, 0.05],
    [100.00, 199.99, 0.10],
    [200.00, Infinity, 0.15]
  ];

  // Return the volume discount rate given an item total
  function volumeRate(total){
    for (const [min,max,rate] of VOLUME_TIERS){
      if (total >= min && total <= max) return rate;
    }
    return 0;
  }

  // Remove a line item entirely (qty=0 => drop row)
  function removeItem(id){
    const next = readCart().filter(it => it.id !== id);
    writeCart(next);
    render();
  }

  // Clear cart = initial state (cart empty, member unchecked)
  function clearCart(){
    writeCart([]);
    document.getElementById('memberToggle').checked = false;
    render();
  }
  /* ================== END UTILITIES & CONSTANTS =========================== */


  /* ====================== STUDENT WORK STARTS HERE =========================
     IMPLEMENT render() to mirror the commission assignment:

     1) Load cart from readCart(); keep only items with qty > 0 and unitPrice > 0
     2) If empty → show #emptyMsg and hide #items and #summary
     3) Build a text-only list in #items:
           Example line: "2 × Celestial Inkstone               $29.90"
           Include a small Remove button per line that calls removeItem(id)
     4) Math (single-discount rule):
           ItemTotal = sum(unitPrice * qty)
           If Member checked AND Volume tier would apply → PROMPT user to choose:
             "Only one discount may be applied. Type 'M' for Member or 'V' for Volume:"
             Apply only the chosen one; set the other to $0.00
           Else apply Member OR Volume (not both)
           Subtotal = ItemTotal − AppliedDiscount + SHIPPING_RATE
           TaxAmount = Subtotal * TAX_RATE
           InvoiceTotal = Subtotal + TaxAmount
     5) Write a single summary block to #summary (like commission):
           Subtotal of Items
           Volume Discount
           Member Discount
           Shipping
           Subtotal (Taxable)
           Tax Rate %   (as a percentage text)
           Tax Amount $ (as currency)
           Invoice Total
     6) Recompute (call render()) after:
           - Member checkbox change
           - Clear Cart
           - Remove line item

     KEEP IT SIMPLE: text output only, one render pass.
  ========================================================================= */

function render() {
    const itemsDiv   = document.getElementById('items');
    const summaryPre = document.getElementById('summary');
    const emptyMsg   = document.getElementById('emptyMsg');
    const isMember   = document.getElementById('memberToggle').checked;

    // Load cart, filter out qty=0 or price=0
    let cart = readCart().filter(item => item.qty > 0 && item.unitPrice > 0);
    
    const countElem = document.getElementById('cartCount');
    if (countElem) {
        countElem.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    if (cart.length === 0) {
        itemsDiv.hidden = true;
        summaryPre.hidden = true;
        emptyMsg.hidden = false;
        itemsDiv.innerHTML = '';
        summaryPre.innerHTML = '';
        return;
    }

    emptyMsg.hidden = true;
    itemsDiv.hidden = false;
    summaryPre.hidden = false;

    // Calculate item total
    const itemTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);

    // Calculate discounts
    const volumeRateValue = volumeRate(itemTotal);
    const volumeDiscount = itemTotal * volumeRateValue;
    const memberDiscount = isMember ? itemTotal * MEMBER_DISCOUNT_RATE : 0;

    let appliedVolume = 0;
    let appliedMember = 0;

    if (isMember && volumeRateValue > 0) {
        const choice = prompt("Only one discount may be applied. Type 'M' for Member or 'V' for Volume:")?.toUpperCase();
        if (choice === 'M') {
            appliedMember = memberDiscount;
        } else {
            appliedVolume = volumeDiscount;
            document.getElementById('memberToggle').checked = false;
        }
    } else if (isMember) {
        appliedMember = memberDiscount;
    } else {
        appliedVolume = volumeDiscount;
    }

    const shipping = SHIPPING_RATE;
    const FREE_SHIPPING_THRESHOLD = 150;
    let shippingDisplay = money(shipping);
    let freeShippingBadge = '';

    if (itemTotal >= FREE_SHIPPING_THRESHOLD) {
        freeShippingBadge = ' — You qualify for free shipping!';
        shippingDisplay = '$0.00';
    }

    const subtotalTaxable = itemTotal - appliedMember - appliedVolume + shipping;
    const taxAmount = subtotalTaxable * TAX_RATE;
    const invoiceTotal = subtotalTaxable + taxAmount;

    // Render items
    itemsDiv.innerHTML = '';
    cart.forEach(item => {
        const lineTotal = item.unitPrice * item.qty;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${item.qty} × ${item.name}</span>
            <button onclick="removeItem('${item.id}')">Remove</button>
            <span class="price">${money(lineTotal)}</span>
        `;
        itemsDiv.appendChild(itemDiv);
    });


    summaryPre.innerHTML = `
        Subtotal of Items:    ${money(itemTotal)}
        Volume Discount:      ${money(-appliedVolume)}
        Member Discount:      ${money(-appliedMember)}
        Shipping:             ${shippingDisplay}${freeShippingBadge}
        Subtotal (Taxable):   ${money(subtotalTaxable)}
        Tax Rate %:           ${(TAX_RATE*100).toFixed(1)}%
        Tax Amount $:         ${money(taxAmount)}
        Invoice Total:        ${money(invoiceTotal)}
            `;
}

  // Events → re-render
  document.getElementById('memberToggle').addEventListener('change', render);
  document.getElementById('clearBtn').addEventListener('click', clearCart);

  // First paint
  render();
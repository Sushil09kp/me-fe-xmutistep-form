document.addEventListener("DOMContentLoaded", () => {
    
    let currentStep = 1;

    const steps = document.querySelectorAll(".form-step");
    const indicators = document.querySelectorAll(".step");
    const nextButtons = document.querySelectorAll(
        '.form-step button:not(.back-button):not(#confirm-button)'
    );
    const backButtons = document.querySelectorAll(".back-button");

    const nameInput = document.querySelector('input[name="userName"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');

    const billingToggle = document.getElementById("billing-toggle");
    const planCards = document.querySelectorAll(".plan_card");
    const addonCards = document.querySelectorAll(".addon_card");

    const summary = document.getElementById("summary");
    const confirmButton = document.getElementById("confirm-button");

    const plans = {
        Arcade: { monthly: 9, yearly: 90 },
        Advance: { monthly: 12, yearly: 120 },
        Pro: { monthly: 15, yearly: 150 }
    };

    const addons = {
        "Online Services": { monthly: 1, yearly: 10 },
        "Larger Storage": { monthly: 2, yearly: 20 },
        "Customizable Profile": { monthly: 2, yearly: 20 }
    };

    let selectedPlan = null;

    indicators.forEach((indicator, index) => {
        const label = document.createElement("span");
        label.textContent = `Step ${index + 1}`;
        label.style.cssText =
            "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);";
        indicator.appendChild(label);
    });

    function showStep(stepNumber) {
        currentStep = stepNumber;

        steps.forEach((step, index) => {
            step.classList.toggle("active", index + 1 === stepNumber);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle(
                "active",
                index + 1 === stepNumber
            );
        });

        nextButtons.forEach(button => {
            button.removeAttribute("id");
        });

        if (stepNumber <= 3) {
            const activeStep = document.getElementById(
                `step-${stepNumber}`
            );
        
            const nextButton = activeStep.querySelector("button:not(.back-button)");
        
            if (nextButton) {
                nextButton.id = "next-button";
            }
        } else if (stepNumber === 4) {
            confirmButton.id = "next-button";
        }

        if (stepNumber === 4) {
            updateSummary();
        }

        window.scrollTo(0, 0);
    }

    function validatePersonalInfo() {
        let isValid = true;
    
        if (nameInput.value.trim() === "") {
            nameInput.setCustomValidity("Name is required");
            isValid = false;
        } else {
            nameInput.setCustomValidity("");
        }
    
        if (!emailInput.validity.valid || emailInput.value.trim() === "") {
            emailInput.setCustomValidity("Please enter a valid email address");
            isValid = false;
        } else {
            emailInput.setCustomValidity("");
        }
    
        const phone = phoneInput.value.trim();
        const phoneDigits = phone.replace(/\D/g, "");

        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            phoneInput.setCustomValidity("Enter a valid phone number");
            isValid = false;
        } else {
            phoneInput.setCustomValidity("");
        }
    
        if (!isValid) {
            [nameInput, emailInput, phoneInput].forEach(field => {
                if (!field.validity.valid) {
                    field.reportValidity();
                }
            });
        }
    
        return isValid;
    }

    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep === 1) {
                if (!validatePersonalInfo()) return;
                showStep(2);
            } else if (currentStep === 2) {
                if (!selectedPlan) {
                    alert("Please select a plan.");
                    return;
                }
                showStep(3);
            } else if (currentStep === 3) {
                showStep(4);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
    });

    planCards.forEach(card => {
        card.addEventListener("click", () => {
            planCards.forEach(plan => {
                plan.classList.remove("selected");
            });

            card.classList.add("selected");
            selectedPlan = card.dataset.plan;
        });
    });

    billingToggle.addEventListener("change", () => {
        const isYearly = billingToggle.checked;

        planCards.forEach(card => {
            const planName = card.dataset.plan;
            const price = plans[planName];

            card.querySelector(".plan-price").textContent =
                isYearly
                    ? `$${price.yearly}/yr`
                    : `$${price.monthly}/mo`;

            const benefit = card.querySelector(".yearly-benefit");
            benefit.style.display = isYearly ? "block" : "none";
        });

        addonCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            const price = addons[checkbox.value];

            card.querySelector("span").textContent =
                isYearly
                    ? `+$${price.yearly}/yr`
                    : `+$${price.monthly}/mo`;
        });
    });

    function updateAddonCard(card) {
        const checkbox = card.querySelector('input[type="checkbox"]');

        card.classList.toggle("selected", checkbox.checked);
    }

    addonCards.forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]');

        card.addEventListener("click", event => {
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }

            updateAddonCard(card);
        });

        checkbox.addEventListener("change", () => {
            updateAddonCard(card);
        });
    });

    function updateSummary() {
        if (!selectedPlan) return;

        const isYearly = billingToggle.checked;
        const duration = isYearly ? "yr" : "mo";

        const planPrice = isYearly
            ? plans[selectedPlan].yearly
            : plans[selectedPlan].monthly;

        let total = planPrice;

        let html = `
            <div class="summary-plan">
                <div>
                    <strong>${selectedPlan} (${isYearly ? "Yearly" : "Monthly"})</strong>
                    <br>
                    <a href="#" class="change-plan">Change</a>
                </div>
                <strong>$${planPrice}/${duration}</strong>
            </div>
            <hr>
        `;

        addonCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');

            if (checkbox.checked) {
                const addonName = checkbox.value;

                const addonPrice = isYearly
                    ? addons[addonName].yearly
                    : addons[addonName].monthly;

                total += addonPrice;

                html += `
                    <div class="summary-addon">
                        <span>${addonName}</span>
                        <span>+$${addonPrice}/${duration}</span>
                    </div>
                `;
            }
        });

        html += `
            <div class="summary-total">
                <span>Total (per ${isYearly ? "year" : "month"})</span>
                <strong>$${total}/${duration}</strong>
            </div>
        `;

        summary.innerHTML = html;

        const changePlan = summary.querySelector(".change-plan");

        changePlan.addEventListener("click", event => {
            event.preventDefault();
            showStep(2);
        });
    }
    confirmButton.addEventListener("click", () => {
        steps.forEach(step => {
            step.classList.remove("active");
        });

        document.getElementById("thank-you").classList.add("active");

        indicators.forEach(indicator => {
            indicator.classList.remove("active");
        });
    });

    showStep(1);
});

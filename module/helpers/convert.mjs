export const INS_MV_CONVERT = {};

INS_MV_CONVERT.convertPlus = (score) => {
    score = String(score).trim();
    if (score.endsWith('+')) {
        const baseStr = score.slice(0, -1);
        const baseNum = parseFloat(baseStr);
        if (isNaN(baseNum)) {
            throw new Error("Valeur numérique invalide dans score: " + score);
        }
        return baseNum >= 0 ? baseNum + 0.5 : baseNum - 0.5;
    } else {
        const num = parseFloat(score);
        if (isNaN(num)) {
            throw new Error("Valeur numérique invalide dans score: " + score);
        }
        return num;
    }
}

INS_MV_CONVERT.convertToPlus = (num) => {
    if (typeof num !== "number" || isNaN(num)) {
        throw new Error("L'argument fourni doit être un nombre valide." + num);
    }
    if (!isFinite(num)) {
        throw new Error("Le nombre fourni doit être fini (pas Infinity ou -Infinity).");
    }
    if (Number.isInteger(num)) {
        return num.toString(); 
    }
    if (Number.isInteger(num * 2)) {
        let signe = num < 0 ? "-" : "";
        let valeurAbsolue = Math.abs(num);
        let partieEntiere = Math.floor(valeurAbsolue);

        return signe + partieEntiere.toString() + "+";
    }

    throw new Error("Le nombre fourni n'est pas dans un format valide pour reverseConvertVersus.");
}
document.addEventListener("DOMContentLoaded", function () {
    const n = 22;
    let array = [];
    let speed = 50; 

    const container = document.getElementById("container");

    init();

    let audioCtx = null;

    function playNote(freq) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const dur = 0.1;
        const osc = audioCtx.createOscillator();
        osc.frequency.value = freq;
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
        const node = audioCtx.createGain();
        node.gain.value = 0.1;
        node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
        osc.connect(node);
        node.connect(audioCtx.destination);
    }

    function init() {
        array = [];
        for (let i = 0; i < n; i++) {
            array.push(Math.floor(Math.random() * 100) + 10);
        }
        showBars();
    }

    function play(algorithm) {
        const copy = [...array];
        let moves = [];

        if (algorithm === "bubble") {
            moves = bubbleSort(copy);
        } else if (algorithm === "selection") {
            moves = selectionSort(copy);
        } else if (algorithm === "insertion") {
            moves = insertionSort(copy);
        } else if (algorithm === "merge") {
            moves = mergeSort(copy);
        } else if (algorithm === "quick") {
            moves = quickSort(copy, 0, copy.length - 1);
        }

        animate(moves);
    }

    function animate(moves) {
        if (moves.length === 0) {
            showBars();
            return;
        }

        const move = moves.shift();
        const [i, j] = move.indices;

        if (move.type === "swap") {
            [array[i], array[j]] = [array[j], array[i]];
        } else if (move.type === "overwrite") {
            array[i] = move.value;
        }

        playNote(200 + array[i] * 5);

        showBars(move);
        setTimeout(() => animate(moves), speed);
    }

    function bubbleSort(arr) {
        const moves = [];
        let swapped;
        do {
            swapped = false;
            for (let i = 1; i < arr.length; i++) {
                if (arr[i - 1] > arr[i]) {
                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                    moves.push({ indices: [i - 1, i], type: "swap" });
                    swapped = true;
                }
            }
        } while (swapped);
        return moves;
    }

    function selectionSort(arr) {
        const moves = [];
        for (let i = 0; i < arr.length; i++) {
            let minIndex = i;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                moves.push({ indices: [i, minIndex], type: "swap" });
            }
        }
        return moves;
    }

    function insertionSort(arr) {
        const moves = [];
        for (let i = 1; i < arr.length; i++) {
            let j = i;
            while (j > 0 && arr[j - 1] > arr[j]) {
                [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
                moves.push({ indices: [j - 1, j], type: "swap" });
                j--;
            }
        }
        return moves;
    }

    function mergeSort(arr) {
        const moves = [];
    
        function merge(left, mid, right) {
            let leftArr = arr.slice(left, mid + 1);
            let rightArr = arr.slice(mid + 1, right + 1);
    
            let i = 0, j = 0, k = left;
    
            while (i < leftArr.length && j < rightArr.length) {
                moves.push({ indices: [left + i, mid + 1 + j], type: "compare" });

                if (leftArr[i] <= rightArr[j]) {
                    arr[k] = leftArr[i];
                    moves.push({ indices: [k], type: "overwrite", value: leftArr[i] });
                    i++;
                } else {
                    arr[k] = rightArr[j];
                    moves.push({ indices: [k], type: "overwrite", value: rightArr[j] });
                    j++;
                }
                k++;
            }

            while (i < leftArr.length) {
                arr[k] = leftArr[i];
                moves.push({ indices: [k], type: "overwrite", value: leftArr[i] });
                i++;
                k++;
            }

            while (j < rightArr.length) {
                arr[k] = rightArr[j];
                moves.push({ indices: [k], type: "overwrite", value: rightArr[j] });
                j++;
                k++;
            }
        }

        function mergeSortHelper(left, right) {
            if (left < right) {
                const mid = Math.floor((left + right) / 2);

                mergeSortHelper(left, mid);
                mergeSortHelper(mid + 1, right);
                merge(left, mid, right);
            }
        }

        mergeSortHelper(0, arr.length - 1);
        return moves;
    }

    function quickSort(arr, low, high) {
        const moves = [];
        function partition(low, high) {
            let pivot = arr[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                if (arr[j] < pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    moves.push({ indices: [i, j], type: "swap" });
                }
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            moves.push({ indices: [i + 1, high], type: "swap" });
            return i + 1;
        }

        function quickSortHelper(low, high) {
            if (low < high) {
                let pi = partition(low, high);
                quickSortHelper(low, pi - 1);
                quickSortHelper(pi + 1, high);
            }
        }

        quickSortHelper(low, high);
        return moves;
    }

    function showBars(move) {
        container.innerHTML = "";
        for (let i = 0; i < array.length; i++) {
            const bar = document.createElement("div");
            bar.style.height = array[i] + "px";
            bar.classList.add("bar");

            if (move && move.indices.includes(i)) {
                bar.classList.add(move.type === "swap" ? "swap" : "compare");
            }

            container.appendChild(bar);
        }
    }

    document.getElementById("speed").addEventListener("input", function () {
        speed = parseInt(this.value);
    });

    window.init = init;
    window.play = play;
});
var documenterSearchIndex = {"docs":
[{"location":"tir_saturation.html#Saturation-of-pair-of-spins-:-direct-and-indirect-solutions","page":"Bi-saturation","title":"Saturation of pair of spins : direct and indirect solutions","text":"","category":"section"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"Previously, we attempted to solve the bi-saturation problem as mentioned in [1] using a direct method. We will now proceed to solve the same problem using an indirect method.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"In this analysis, we will use the solution obtained from the direct method as an integral component of the shooting method. By leveraging the direct method's results, we aim to enhance the accuracy and efficiency of the shooting method's implementation.","category":"page"},{"location":"tir_saturation.html#Direct-Method-:","page":"Bi-saturation","title":"Direct Method :","text":"","category":"section"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"Let's first import the necessary packages, OptimalControl, Plots ... : ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"using OrdinaryDiffEq\nusing LinearAlgebra: norm\nusing MINPACK\nusing OptimalControl\nusing Plots\nusing NLPModelsIpopt","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We will now define the parameters and the functions that we will use later on : ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Define the parameters of the problem and the starting point\nΓ = 9.855e-2  \nγ = 3.65e-3  \nϵ = 0.1\nq0 = [0, 1, 0, 1]\n\n@def ocp1 begin\n    tf ∈ R, variable \n    t ∈ [0, tf], time \n    x ∈ R⁴, state    \n    u ∈ R, control    \n    tf ≥ 0            \n    -1 ≤ u(t) ≤ 1     \n    x(0) == [0, 1, 0, 1]\n    x(tf) == [0, 0, 0, 0] \n    \n    ẋ(t) == [(-Γ*x₁(t) -u(t)*x₂(t)), \n             (γ*(1-x₂(t)) +u(t)*x₁(t)), \n             (-Γ*x₃(t) -(1-ϵ)* u(t)*x₄(t)), \n             (γ*(1-x₄(t)) +(1-ϵ)*u(t)*x₃(t))]\n    tf → min \nend\n\n@def ocp2 begin\n    tf ∈ R, variable \n    t ∈ [0, tf], time \n    x ∈ R⁴, state    \n    u ∈ R, control    \n    tf ≥ 0            \n    -1 ≤ u(t) ≤ 1     \n    x(0) == [0.1, 0.9, 0.1, 0.9]\n    x(tf) == [0, 0, 0, 0] \n    \n    ẋ(t) == [(-Γ*x₁(t) -u(t)*x₂(t)), \n             (γ*(1-x₂(t)) +u(t)*x₁(t)), \n             (-Γ*x₃(t) -(1-ϵ)* u(t)*x₄(t)), \n             (γ*(1-x₄(t)) +(1-ϵ)*u(t)*x₃(t))]\n    tf → min \nend\n# Function to plot the solution of the optimal control problem\nfunction plot_sol(sol)\n    q = sol.state\n    liste = [q(t) for t in sol.times]\n    liste_y1 = [elt[1] for elt in liste]\n    liste_z1 = [elt[2] for elt in liste]\n    liste_y2 = [elt[3] for elt in liste]\n    liste_z2 = [elt[4] for elt in liste]\n    plot(\n        plot(liste_y1, liste_z1, xlabel=\"y1\", ylabel=\"z1\"),\n        plot(liste_y2, liste_z2, xlabel=\"y2\", ylabel=\"z2\"),\n        plot(sol.times, sol.control, xlabel=\"Time\", ylabel=\"Control\")\n    )\nend\n\n\nfunction F0i(q)\n    y, z = q\n    res = [-Γ*y, γ*(1-z)]\n    return res\nend\n\nfunction F1i(q)\n    y, z = q\n    res = [-z, y]\n    return res\nend\n\nF0(q) = [ F0i(q[1:2]); F0i(q[3:4]) ]\nF1(q) = [ F1i(q[1:2]); (1 - ϵ) * F1i(q[3:4]) ]","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We will use the same technique used before to solve the problem which involves using the solution of the same problem but with a slight change in the initial conditions, as an initial guess. ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"initial_g = solve(ocp2; grid_size=1000, linear_solver=\"mumps\")\ndirect_sol = solve(ocp1; grid_size=1000, init=initial_g, linear_solver=\"mumps\")","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We will now plot the solution : ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"plt = plot(direct_sol, solution_label=\"(direct)\")","category":"page"},{"location":"tir_saturation.html#Indirect-Method-:","page":"Bi-saturation","title":"Indirect Method :","text":"","category":"section"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"A quick look on the plot of the control u, reveals that the optimal solution consists of a bang arc with minimal control(-1), followed by a singular arc, then another bang arc with maximal control (+1), and the final arc is a singular arc, which means that we have a solution with a structure of the form BSBS, i.e. Bang-Singular-Bang-Singular [1].  First, let's define the Hamiltonian operator. Since : ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"dot q = F_0(q) + u * F_1(q)","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"then : ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"H(qp) = p * F_0(q) + u * p * F_1(q)","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We'll note : H_0(qp) = p * F_0(q)  and H_1(qp) = p * F_1(q) Let u_+ = 1, the positive bang control (resp. u_- = -1 the negative bang control),  and ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"u_s(qp) = - fracH_001H_101 ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"the singular control, where : H_001 = H_0  H_0 H_1 H_101 = H_1 H_0 H_1 and for two Hamiltonien operators H_0 H_1 :  ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"H_0 H_1 =(nabla_p H_0   nabla_x H_1 )  (nabla_x H_0  nabla_p H_1)","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"First, we refine the solution with a higher grid size for better accuracy. We also lift the vector fields to their Hamiltonian counterparts and compute the Lie brackets of these Hamiltonian vector fields. Additionally, we define the singular control function and extract the solution components.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Lift the vector fields to their Hamiltonian counterparts\nH0 = Lift(F0) \nH1 = Lift(F1)\n\n# Compute the Lie brackets of the Hamiltonian vector fields\nH01  = @Lie { H0, H1 }\nH001 = @Lie { H0, H01 }\nH101 = @Lie { H1, H01 }\n\n# Define the singular control function\nus(q, p) = -H001(q, p) / H101(q, p)\n\n#~Define the maximum control\numax = 1\n\n# Extract the solution components\nt = direct_sol.times\nq = direct_sol.state\nu = direct_sol.control\np = direct_sol.costate\n\n# Define the flows for maximum, minimum, and singular controls\nfₚ = Flow(ocp1, (q, p, tf) -> umax)\nfₘ = Flow(ocp1, (q, p, tf) -> -umax)\nfs = Flow(ocp1, (q, p, tf) -> us(q, p))","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"Next, we define a function to compute the shooting function for the indirect method. This function calculates the state and costate at the switching times and populates the shooting function residuals based on its expression :","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"S  mathbbR^32 rightarrow mathbbR^32","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"y =\nbeginbmatrix\np_0 \nt_f \nt_1 \nt_2 \nt_3 \nz_1 \nz_2 \nz_3\nendbmatrix\nmapsto S(y) =\nbeginbmatrix\nu pm H_1(z_0) + p_0 \nH_1(z_1) \nH_1(z_1) \nH_1(z_3) \nH_1(z_3) \ny_2(t_f t_3 z_3 u_s) \nz_2(t_f t_3 z_3 u_s) \n(p_z_1(t_f t_3 z_3 u_s) + p_z_2(t_f t_3 z_3 u_s)) gamma + p_0 \nz(t_1 0 z_0 u pm) - z_1 \nz(t_2 t_1 z_1 u_s) - z_2 \nz(t_3 t_2 z_2 u pm) - z_3\nendbmatrix","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Function to compute the shooting function for the indirect method\nfunction shoot!(s, p0, t1, t2, t3, tf, q1, p1, q2, p2, q3, p3)\n    qi1, pi1 = fₘ(0, q0, p0, t1)\n    qi2, pi2 = fs(t1, q1, p1, t2)\n    qi3, pi3 = fₚ(t2, q2, p2, t3)\n    qf, pf = fs(t3, q3, p3, tf)\n    s[1] = H0(q0, p0) - umax * H1(q0, p0) - 1  \n    s[2] = H1(q1, p1)\n    s[3] = H01(q1, p1)\n    s[4] = H1(q3, p3)\n    s[5] = H01(q3, p3)\n    s[6] = qf[3]\n    s[7] = qf[4]\n    s[8] = (pf[2] + pf[4]) * γ - 1\n    s[9:12] = qi1 - q1\n    s[13:16] = pi1 - p1\n    s[17:20] = qi2 - q2\n    s[21:24] = pi2 - p2\n    s[25:28] = qi3 - q3\n    s[29:32] = pi3 - p3\nend","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We then initialize parameters to find the switching times. We identify the intervals where the control is near zero, indicating singular control, and determine the switching times.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Initialize parameters for finding switching times\nt0 = 0\ntol = 2e-2\n\n# Find times where control is near zero (singular control)\nt13 = [elt for elt in t if abs(u(elt)) < tol]\ni = 1\nt_l = []\n\n# Identify intervals for switching times\nwhile(true)\n    global i \n    if (( i == length(t13)-1) || (t13[i+1] - t13[i] > 1) )\n        break\n    else \n        push!(t_l, t13[i])\n        push!(t_l, t13[i+1])\n        i += 1\n    end\nend\n\n# Determine the switching times\nt1 = min(t_l...)\nt2 = max(t_l...)\nt3f = [elt for elt in t13 if elt > t2]\nt3 = min(t3f...)\n\n# Extract initial and intermediate costates and states and final time\np0 = p(t0) \n\ntf = direct_sol.objective\nq1, p1 = q(t1), p(t1)\nq2, p2 = q(t2), p(t2)\nq3, p3 = q(t3), p(t3)\nδ = γ - Γ\nzs = γ/(2*δ)\n\nq1[2] = zs\np1[2] = p1[1] * (zs / q1[1])\nq1[4] = zs\np1[4] = p1[3] *(zs / q1[3])\np0[1] = -1\np0[3] = -1\nprintln(\"p0 = \", p0)\nprintln(\"t1 = \", t1)\nprintln(\"t2 = \", t2)\nprintln(\"t3 = \", t3)\nprintln(\"tf = \", tf)\nprintln(\"p1 = \", p1)\nprintln(\"p2 = \", p2)\nprintln(\"p3 = \", p3)\nprintln(\"q1 = \", q1)\nprintln(\"q2 = \", q2)\nprintln(\"q3 = \", q3)","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"Next, we initialize the shooting function residuals and compute the initial residuals for the shooting function to verify the solution's accuracy. ","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Initialize the shooting function residuals\ns = similar(p0, 32)\n\n# Compute the initial residuals for the shooting function\nshoot!(s, p0, t1, t2, t3, tf, q1, p1, q2, p2, q3, p3)\nprintln(\"Norm of the shooting function: ‖s‖ = \", norm(s), \"\\n\")","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"The direct solution is not very accurate, as shown by the shooting function's value of about 111 using the parameters from the direct method.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We now define a nonlinear equation solver for the shooting method. This solver refines the initial costate, switching times and the intermediate states and costates to find the optimal solution using the shooting function.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Define a nonlinear equation solver for the shooting method\nnle = (s, ξ) -> shoot!(s, ξ[1:4], ξ[5], ξ[6], ξ[7], ξ[8], ξ[9:12], ξ[13:16], ξ[17:20], ξ[21:24], ξ[25:28], ξ[29:32])   \nξ = [ p0 ; t1 ; t2 ; t3 ; tf ; q1 ; p1 ; q2 ; p2 ; q3 ; p3 ]\n# Solve the shooting equations to find the optimal times and costate\n\nindirect_sol = fsolve(nle, ξ; tol=5e-3, show_trace=true)","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"We extract the initial costate, switching times and the intermediate states and costates. We then recompute the residuals for the shooting function to ensure the accuracy of the refined solution. Therefore, we conclude that this solution is more accurate, as the norm of s in this case is 10^6 smaller than the previously computed one using the direct method.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Extract the refined initial costate and switching times from the solution\np0 = indirect_sol.x[1:4]\nt1 = indirect_sol.x[5]\nt2 = indirect_sol.x[6]\nt3 = indirect_sol.x[7]\ntf = indirect_sol.x[8]\nq1, p1, q2, p2, q3, p3 = indirect_sol.x[9:12], indirect_sol.x[13:16], indirect_sol.x[17:20], indirect_sol.x[21:24], indirect_sol.x[25:28], indirect_sol.x[29:32]\n\n# Recompute the residuals for the shooting function\ns = similar(p0, 32)\nshoot!(s, p0, t1, t2, t3, tf, q1, p1, q2, p2, q3, p3)\nprintln(\"Norm of the shooting function: ‖s‖ = \", norm(s), \"\\n\")","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"Finally, we define the composed flow solution using the switching times and controls. We compute the flow solution over the time interval and plot both the direct and indirect solutions for comparison.","category":"page"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"# Define the composed flow solution using the switching times and controls\nf_sol = fₘ * (t1, fs) * (t2, fₚ) * (t3, fs)\n\n# Compute the flow solution over the time interval\nflow_sol = f_sol((t0, tf), q0, p0) \n\n# Plot the direct and indirect solutions for comparison\n\nplot(plt, flow_sol, solution_label=\"(indirect)\")","category":"page"},{"location":"tir_saturation.html#References","page":"Bi-saturation","title":"References","text":"","category":"section"},{"location":"tir_saturation.html","page":"Bi-saturation","title":"Bi-saturation","text":"[1]: Bernard Bonnard, Olivier Cots, Jérémy Rouot, Thibaut Verron. Time minimal saturation of a pair of spins and application in magnetic resonance imaging. Mathematical Control and Related Fields, 2020, 10 (1), pp.47-88.","category":"page"},{"location":"index.html#spin","page":"Introduction","title":"spin","text":"","category":"section"},{"location":"index.html","page":"Introduction","title":"Introduction","text":"spin is part of the control-toolbox ecosystem.","category":"page"},{"location":"index.html","page":"Introduction","title":"Introduction","text":"note: Install\nTo install a package from the control-toolbox ecosystem,  please visit the installation page.","category":"page"}]
}

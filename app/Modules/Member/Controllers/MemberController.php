<?php

namespace App\Modules\Member\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Member\Models\Member;
use App\Modules\Member\Requests\StoreMemberRequest;
use App\Modules\Member\Requests\UpdateMemberRequest;
use App\Modules\Member\Services\MemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk menangani member management
 * Thin controller yang hanya memanggil MemberService
 */
class MemberController extends Controller
{
    public function __construct(
        protected MemberService $memberService
    ) {}

    /**
     * Display a listing of the members.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();

        $members = $this->memberService->getAllMembers($perPage, $search ?: null);
        $vehicles = $this->memberService->getAllVehicles();
        $memberTypes = $this->memberService->getMemberTypes();
        $memberPackages = $this->memberService->getMemberPackages();

        return Inertia::render('member/index', [
            'members' => $members,
            'vehicles' => $vehicles,
            'memberTypes' => $memberTypes,
            'memberPackages' => $memberPackages,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created member in storage.
     */
    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $this->memberService->createMember($request->validated());

        return redirect()->route('member.index')
            ->with('success', 'Member created successfully');
    }

    /**
     * Update the specified member in storage.
     */
    public function update(UpdateMemberRequest $request, Member $member): RedirectResponse
    {
        $this->memberService->updateMember($member, $request->validated());

        return redirect()->route('member.index')
            ->with('success', 'Member updated successfully');
    }

    /**
     * Remove the specified member from storage.
     */
    public function destroy(Member $member): RedirectResponse
    {
        try {
            $this->memberService->deleteMember($member);

            return redirect()->route('member.index')
                ->with('success', 'Member deleted successfully');
        } catch (ValidationException $e) {
            return redirect()->route('member.index')
                ->with('error', $e->getMessage());
        }
    }
}
